import html2pdf from 'html2pdf.js';
import { generateSalesReceiptHTML } from './salesReceipt.js';
import { generateQuotationReceiptHTML } from './quotationReceipt.js';

export function generateWhatsAppLink(data, type = "Sale", extraText = "") {
  const isQuotation = type === "Quotation";
  let text = `*RAM ROOFING INDUSTRIES*\n*${isQuotation ? "Quotation" : "Sales Receipt"}*\n`;
  text += `ID: ${data.id}\n`;
  text += `Customer: ${data.customerName}\n`;
  if (data.mobile) text += `Phone: ${data.mobile}\n`;
  text += `----------------\n`;
  const items = Array.isArray(data.items) ? data.items : [];
  items.forEach(it => {
    text += `${it.qty} x ${it.name} - ₹${(Number(it.qty) * Number(it.price)).toFixed(2)}\n`;
  });
  text += `----------------\n`;
  if (data.subtotal > 0) text += `Subtotal: ₹${Number(data.subtotal).toFixed(2)}\n`;
  if (data.taxAmount > 0) text += `Tax: ₹${Number(data.taxAmount).toFixed(2)}\n`;
  if (data.needShipping && data.shippingCharge >= 0) text += `Shipping: ₹${Number(data.shippingCharge).toFixed(2)}\n`;
  text += `*Total: ₹${Number(data.total).toFixed(2)}*\n`;
  text += `Thank you!`;
  
  if (extraText) {
    text += `\n\n${extraText}`;
  }
  
  let phone = (data.mobile || "").replace(/\D/g, "");
  if (phone && phone.length === 10) phone = "91" + phone; 
  
  const encodedText = encodeURIComponent(text);
  if (phone) {
    return `https://wa.me/${phone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export async function shareViaWhatsApp(data, type = "Sale", opts = {}) {
  try {
    const isQuotation = type === "Quotation";
    const htmlString = isQuotation ? generateQuotationReceiptHTML(data) : generateSalesReceiptHTML(data, opts);
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '800px';
    iframe.style.height = '600px';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(htmlString);
    iframe.contentDocument.close();
    
    const element = iframe.contentDocument.documentElement;
    
    const opt = {
      margin:       10,
      filename:     `${isQuotation ? 'Quotation' : 'Receipt'}_${data.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    document.body.removeChild(iframe);
    
    const pdfFile = new File([pdfBlob], opt.filename, { type: "application/pdf" });
    
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        title: opt.filename,
        text: `Here is your ${isQuotation ? 'Quotation' : 'Sales Receipt'} from RAM ROOFING.`,
        files: [pdfFile]
      });
      return; 
    }
    
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = opt.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert("The PDF has been downloaded to your computer. When WhatsApp opens, please attach the downloaded PDF file to the chat manually.");
    
    const extraText = `(Please see the attached PDF for the full document)`;
    const link = generateWhatsAppLink(data, type, extraText);
    window.open(link, "_blank");
    
  } catch (error) {
    console.error("Failed to share PDF", error);
    alert("Failed to generate PDF. Falling back to text sharing.");
    const link = generateWhatsAppLink(data, type);
    window.open(link, "_blank");
  }
}
