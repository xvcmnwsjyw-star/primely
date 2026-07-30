import PDFDocument from "pdfkit";
import Certificate from "../models/Certificate.js";

// GET /api/certificates/mine
export const getMyCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ user: req.user._id }).populate("course", "title");
    res.json(certs);
  } catch (err) {
    next(err);
  }
};

// GET /api/certificates/:certificateId/download -> streams a PDF
export const downloadCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate("user", "name")
      .populate("course", "title");

    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=primely-certificate-${cert.certificateId}.pdf`
    );

    const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 50 });
    doc.pipe(res);

    doc
      .fontSize(12)
      .fillColor("#B9760F")
      .text("PRIMELY", { align: "center" });
    doc.moveDown(2);
    doc
      .fontSize(28)
      .fillColor("#1F2E1B")
      .text("Certificate of completion", { align: "center" });
    doc.moveDown(1.5);
    doc
      .fontSize(16)
      .fillColor("#444")
      .text("This certifies that", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(24)
      .fillColor("#1F2E1B")
      .text(cert.user.name, { align: "center", underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(16)
      .fillColor("#444")
      .text("has successfully completed the course", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(20)
      .fillColor("#1F2E1B")
      .text(cert.course.title, { align: "center" });
    doc.moveDown(2);
    doc
      .fontSize(11)
      .fillColor("#888")
      .text(`Issued ${new Date(cert.issuedAt).toDateString()}  ·  Certificate ID: ${cert.certificateId}`, {
        align: "center",
      });

    doc.end();
  } catch (err) {
    next(err);
  }
};
