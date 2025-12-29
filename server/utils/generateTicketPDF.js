const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateTicketPDF = (booking, event, user) => {
    return new Promise((resolve, reject) => {//object
        try {
            const doc = new PDFDocument({
                size: [400, 700], // Vertical size
                margin: 0
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- STYLING VARS ---
            const darkFooter = '#0f172a';
            const blueAccent = '#2563eb';
            const white = '#ffffff';
            const gray900 = '#111827';
            const gray400 = '#9ca3af';

            // --- TOP BANNER ---
            // Simulate Banner image background (since we don't have the real image securely accessible here quickly,
            // we will use a gradient or solid color, OR if we had the image path we would use it.
            // For now, let's use a stylish placeholder logic or just a solid color block to prevent errors with remote URLs).
            // NOTE: In production, you'd fetch the image buffer from URL. Here we'll do geometric design.

            doc.rect(0, 0, 400, 250).fill(blueAccent); // Placeholder for image
            // Gradient Overlay effect simulation
            doc.rect(0, 0, 400, 250).fillOpacity(0.3).fill('black');
            doc.fillOpacity(1);

            // Category Badge
            doc.roundedRect(24, 180, 80, 20, 4).fill(blueAccent);
            doc.fillColor(white).fontSize(8).font('Helvetica-Bold').text((event.category || 'EVENT').toUpperCase(), 24, 186, { width: 80, align: 'center' });

            // Title
            doc.fillColor(white).fontSize(22).font('Helvetica-Bold').text(event.title, 24, 210, { width: 350, lineGap: 2 });


            // --- BODY ---
            doc.rect(0, 250, 400, 310).fill(white); // White body area

            // Grid
            let y = 280;
            const col1 = 24;
            const col2 = 200;

            // Date & Time
            doc.fillColor(gray400).fontSize(8).font('Helvetica-Bold').text('DATE', col1, y);
            doc.fillColor(gray900).fontSize(10).text(new Date(event.startDate).toDateString(), col1, y + 12);

            doc.fillColor(gray400).fontSize(8).text('TIME', col2, y);
            doc.fillColor(gray900).fontSize(10).text(new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), col2, y + 12);

            // Venue
            y += 50;
            doc.fillColor(gray400).fontSize(8).text('VENUE', col1, y);
            doc.fillColor(gray900).fontSize(10).text(`${event.venue.address}, ${event.venue.city}`, col1, y + 12, { width: 350 });

            // Divider Line with "Cutouts"
            y += 60;
            doc.lineWidth(1).dash(4, { space: 4 }).strokeColor(gray400);
            doc.moveTo(24, y).lineTo(376, y).stroke();
            doc.undash();
            // Circles
            doc.circle(0, y, 12).fill('#f1f5f9'); // background color match needed? Assuming light bg behind pdf? or just white circles to cut.
            doc.circle(400, y, 12).fill('#f1f5f9');

            // Attendee
            y += 30;
            doc.fillColor(gray400).fontSize(8).text('ATTENDEE', col1, y);
            doc.fillColor(gray900).fontSize(14).font('Helvetica-Bold').text(user.name || 'GUEST', col1, y + 12);

            doc.fillColor(gray400).fontSize(8).text('TICKET ID', 250, y, { width: 126, align: 'right' });
            doc.fillColor(gray900).fontSize(10).text(`#${booking._id.toString().slice(-6)} `, 250, y + 12, { width: 126, align: 'right' });


            // --- FOOTER (Dark) ---
            const footerY = 560;
            doc.rect(0, footerY, 400, 140).fill(darkFooter);

            // Admit One & Price
            const footerContentY = footerY + 30;
            doc.fillColor(gray400).fontSize(8).text('ADMIT ONE', col1, footerContentY);
            doc.fillColor(blueAccent).fontSize(24).font('Helvetica-Bold').text(event.ticketType === 'Free' ? 'FREE' : `$${event.price} `, col1, footerContentY + 15);
            doc.fillColor(gray400).fontSize(8).font('Helvetica').text('Presented by CityPulse', col1, footerContentY + 50);

            // QR Code Placeholder
            doc.rect(280, footerY + 20, 90, 90).fill(white);
            doc.fillColor(gray900).fontSize(8).text('QR CODE', 280, footerY + 60, { width: 90, align: 'center' });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateTicketPDF;
