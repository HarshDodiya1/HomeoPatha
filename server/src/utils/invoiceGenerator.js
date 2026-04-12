/**
 * Invoice HTML Generator
 * Generates a printable HTML invoice from order data
 */

function numberToWords(num) {
  if (num === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertChunk(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " and " + convertChunk(n % 100) : "")
    );
  }

  const units = ["", "Thousand", "Lakh", "Crore"];
  const integer = Math.floor(Math.abs(num));
  const decimal = Math.round((Math.abs(num) - integer) * 100);

  let result = "";
  let remaining = integer;

  // First chunk: last 3 digits
  const firstChunk = remaining % 1000;
  remaining = Math.floor(remaining / 1000);
  if (firstChunk) result = convertChunk(firstChunk);

  // Subsequent chunks: 2 digits each (Indian numbering)
  let unitIndex = 1;
  while (remaining > 0) {
    const chunk = remaining % 100;
    remaining = Math.floor(remaining / 100);
    if (chunk) {
      result = convertChunk(chunk) + " " + units[unitIndex] + (result ? " " + result : "");
    }
    unitIndex++;
  }

  let words = result + " Rupees";
  if (decimal > 0) {
    words += " and " + convertChunk(decimal) + " Paise";
  }
  words += " Only";

  return words;
}

function formatDate(date) {
  const d = new Date(date);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate invoice HTML from order and user data
 * @param {Object} order - The order document (populated)
 * @param {Object} user - The user document
 * @returns {string} Complete HTML string
 */
function generateInvoiceHTML(order, user) {
  const invoiceNumber = order.invoiceNumber || `HP-${order._id.toString().slice(-8).toUpperCase()}`;
  const invoiceDate = formatDate(order.createdAt);
  const shippingCharges = order.shippingCharges || 0;
  const totalAmount = order.totalAmount;
  const itemsSubtotal = order.orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const hasGst = order.orderItems.some(i => (i.cgstRate || 0) > 0 || (i.sgstRate || 0) > 0);
  const totalCgstAmount = order.orderItems.reduce((s, i) => s + (i.price * i.quantity * (i.cgstRate || 0) / 100), 0);
  const totalSgstAmount = order.orderItems.reduce((s, i) => s + (i.price * i.quantity * (i.sgstRate || 0) / 100), 0);
  const amountInWords = numberToWords(totalAmount);

  const customerName = escapeHtml(user.fullName);
  const customerEmail = escapeHtml(user.email);
  const customerPhone = escapeHtml(user.phoneNumber);
  const addr = order.shippingAddress;
  const customerAddress = escapeHtml(
    [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ")
  );
  const customerCity = escapeHtml(
    [addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")
  );
  const bd = order.billingDetails || {};
  const hasHsn = order.orderItems.some(item => item.hsnCode);

  // Build items rows
  const itemsHTML = order.orderItems
    .map((item, index) => {
      const base = item.price * item.quantity;
      const cgstRate = item.cgstRate || 0;
      const sgstRate = item.sgstRate || 0;
      const cgstAmt = base * cgstRate / 100;
      const sgstAmt = base * sgstRate / 100;
      const itemTotal = base.toFixed(2);
      return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>
                            <div class="item-description">${escapeHtml(item.title)}</div>
                        </td>
                        ${hasHsn ? `<td>${escapeHtml(item.hsnCode || "")}</td>` : ""}
                        <td>Nos</td>
                        <td>${item.quantity}</td>
                        <td>&#8377; ${item.price.toFixed(2)}</td>
                        <td>&#8377; ${itemTotal}</td>
                    </tr>`;
    })
    .join("\n");

  // Build GST table data grouped by HSN code + tax rates
  const gstTableHTML = (() => {
    if (!hasGst) return "";

    // Group items by HSN code + cgstRate + sgstRate combination
    const groups = {};
    order.orderItems.forEach(item => {
      const cgstR = item.cgstRate || 0;
      const sgstR = item.sgstRate || 0;
      if (cgstR === 0 && sgstR === 0) return;
      const key = `${item.hsnCode || "N/A"}_${cgstR}_${sgstR}`;
      if (!groups[key]) groups[key] = { hsnCode: item.hsnCode || "N/A", cgstRate: cgstR, sgstRate: sgstR, taxableValue: 0 };
      groups[key].taxableValue += item.price * item.quantity;
    });

    let totalTaxableValue = 0;
    let totalCgstAmt = 0;
    let totalSgstAmt = 0;
    let totalTaxAmount = 0;

    const rows = Object.values(groups).map(g => {
      const cgst = g.taxableValue * g.cgstRate / 100;
      const sgst = g.taxableValue * g.sgstRate / 100;
      const tax = cgst + sgst;
      totalTaxableValue += g.taxableValue;
      totalCgstAmt += cgst;
      totalSgstAmt += sgst;
      totalTaxAmount += tax;
      return `<tr>
        <td class="hsn-col">${escapeHtml(g.hsnCode)}</td>
        <td>&#8377; ${g.taxableValue.toFixed(2)}</td>
        <td>${g.cgstRate}%</td>
        <td>&#8377; ${cgst.toFixed(2)}</td>
        <td>${g.sgstRate}%</td>
        <td>&#8377; ${sgst.toFixed(2)}</td>
        <td>&#8377; ${tax.toFixed(2)}</td>
      </tr>`;
    }).join("\n");

    return `
        <!-- GST Summary Table -->
        <div class="gst-table-section">
            <table class="gst-table">
                <thead>
                    <tr>
                        <th rowspan="2" class="hsn-col" style="text-align:left;">HSN/SAC</th>
                        <th rowspan="2">Taxable Value</th>
                        <th colspan="2">CGST</th>
                        <th colspan="2">SGST/UTGST</th>
                        <th rowspan="2">Total Tax Amount</th>
                    </tr>
                    <tr>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="total-row">
                        <td class="hsn-col"><strong>Total</strong></td>
                        <td><strong>&#8377; ${totalTaxableValue.toFixed(2)}</strong></td>
                        <td></td>
                        <td><strong>&#8377; ${totalCgstAmt.toFixed(2)}</strong></td>
                        <td></td>
                        <td><strong>&#8377; ${totalSgstAmt.toFixed(2)}</strong></td>
                        <td><strong>&#8377; ${totalTaxAmount.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>`;
  })();

  const paymentMethodText =
    order.paymentMethod === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery";
  const paymentStatusText =
    order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4;
            margin: 8mm;
        }

        @media print {
            html {
                background: white !important;
            }

            body {
                margin: 0;
                padding: 0;
                background: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .no-print {
                display: none !important;
            }

            .document {
                width: 100%;
                margin: 0;
                border: 2px solid #000;
                background: white !important;
            }
        }

        @media screen {
            body {
                background: #e0e0e0;
                padding: 0px;
            }

            .document {
                max-width: 100%;
                min-height: 100vh;
                margin: 0 auto;
                background: white;
                border: 2px solid #000;
            }
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
        }

        .header-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 2px solid #000;
            min-height: 100px;
        }

        .logo-section {
            padding: 20px;
            border-right: 2px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
        }

        .logo-text {
            font-size: 28pt;
            font-weight: bold;
            color: #16a34a;
            letter-spacing: 2px;
        }

        .logo-subtitle {
            font-size: 10pt;
            color: #666;
            text-align: center;
            margin-top: 4px;
        }

        .title-section {
            padding: 20px 25px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: white;
        }

        .title-section h1 {
            font-size: 18pt;
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .invoice-details-header {
            margin-top: 10px;
        }

        .invoice-details-header .detail-line {
            font-size: 11pt;
            margin-bottom: 3px;
        }

        .invoice-details-header .detail-line strong {
            min-width: 110px;
            display: inline-block;
            font-weight: 700;
        }

        .info-row {
            display: grid;
            border-bottom: 2px solid #000;
        }

        .info-row.two-column {
            grid-template-columns: 1fr 1fr;
        }

        .info-column {
            padding: 18px 25px;
            background: white;
            border-right: 2px solid #000;
        }

        .info-column:last-child {
            border-right: none;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #000;
            text-transform: uppercase;
        }

        .info-line {
            margin-bottom: 5px;
            font-size: 11.5pt;
        }

        .info-line strong {
            font-weight: 700;
            min-width: 70px;
            display: inline-block;
        }

        .company-name {
            font-size: 13pt;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000;
        }

        .table-section {
            border-bottom: 2px solid #000;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
        }

        .items-table thead th {
            background: #16a34a;
            color: white;
            padding: 14px 12px;
            text-align: left;
            font-weight: 700;
            font-size: 11.5pt;
            text-transform: uppercase;
            border-right: 1px solid #fff;
            border-bottom: 1px solid #000;
        }

        .items-table thead th:last-child {
            border-right: none;
        }

        .items-table tbody td {
            padding: 14px 12px;
            border-bottom: 1px solid #000;
            border-right: 1px solid #000;
            font-size: 11.5pt;
            vertical-align: top;
        }

        .items-table tbody td:last-child {
            border-right: none;
        }

        .items-table tbody tr:last-child td {
            border-bottom: none;
        }

        .item-description {
            font-weight: 700;
            margin-bottom: 4px;
        }

        .summary-section {
            border-bottom: 2px solid #000;
            background: white;
        }

        .summary-content {
            padding: 15px 25px;
            display: flex;
            justify-content: flex-end;
        }

        .summary-table {
            width: 350px;
        }

        .summary-row {
            display: grid;
            grid-template-columns: 1fr auto;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }

        .summary-row:last-child {
            border-bottom: none;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 5px;
        }

        .summary-label {
            font-size: 11.5pt;
            font-weight: 600;
        }

        .summary-value {
            font-size: 11.5pt;
            font-weight: 700;
            text-align: right;
        }

        .summary-row:last-child .summary-label,
        .summary-row:last-child .summary-value {
            font-size: 13pt;
            font-weight: bold;
        }

        .amount-words-row {
            padding: 15px 25px;
            border-bottom: 2px solid #000;
            background: #f0fdf4;
        }

        .amount-words-row .label {
            font-size: 10pt;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-weight: 600;
        }

        .amount-words-row .value {
            font-size: 12pt;
            font-weight: bold;
            color: #000;
        }

        .footer-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 130px;
        }

        .payment-section,
        .notes-section {
            padding: 18px;
        }

        .payment-section {
            border-right: 2px solid #000;
            background: white;
        }

        .notes-section {
            background: white;
        }

        .footer-title {
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            color: #16a34a;
        }

        .footer-content {
            font-size: 10.5pt;
            line-height: 1.6;
        }

        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #16a34a;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }

        .print-button:hover {
            background: #15803d;
        }

        .status-badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 10pt;
            font-weight: 600;
        }

        .status-completed {
            background: #dcfce7;
            color: #166534;
        }

        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }

        .status-failed {
            background: #fecaca;
            color: #991b1b;
        }

        .gst-table-section {
            border-bottom: 2px solid #000;
            background: white;
        }

        .gst-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5pt;
        }

        .gst-table th {
            background: #f0fdf4;
            color: #000;
            padding: 8px 10px;
            text-align: center;
            font-weight: 700;
            border: 1px solid #000;
            font-size: 10pt;
        }

        .gst-table td {
            padding: 7px 10px;
            border: 1px solid #000;
            text-align: center;
            font-size: 10.5pt;
        }

        .gst-table .total-row td {
            font-weight: 700;
            background: #f9fafb;
        }

        .gst-table .hsn-col {
            text-align: left;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">Print Invoice</button>

    <div class="document">
        <!-- Header: Logo and Title -->
        <div class="header-row">
            <div class="logo-section">
                <div style="text-align: center;">
                    <div class="logo-text">The HomeoPatha</div>
                    <div class="logo-subtitle" style="font-size: 12pt; font-weight: 700; color: #333; margin-top: 6px; letter-spacing: 1px;">MAHADEV &amp; SONS TRADING COMPANY</div>
                    <div class="logo-subtitle">Your Trusted Homeopathy Partner</div>
                    <div class="logo-subtitle" style="margin-top: 4px; font-weight: 600;">GSTIN: 08LVNPS5268K1ZD</div>
                </div>
            </div>
            <div class="title-section">
                <h1>Invoice</h1>
                <div class="invoice-details-header">
                    <div class="detail-line">
                        <strong>Invoice No:</strong>
                        <span>${invoiceNumber}</span>
                    </div>
                    <div class="detail-line">
                        <strong>Invoice Date:</strong>
                        <span>${invoiceDate}</span>
                    </div>
                    <div class="detail-line">
                        <strong>Order Status:</strong>
                        <span>${escapeHtml(order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1))}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Info Row: Seller and Customer -->
        <div class="info-row two-column">
            <div class="info-column">
                <div class="section-title">From</div>
                <div class="company-name">The HomeoPatha</div>
                <div class="info-line"><span>Mishrawari, Bathario Ka Chawk, Nagaur, Rajasthan 341001</span></div>
                <div class="info-line"><strong>GSTIN:</strong> <span>08LVNPS5268K1ZD</span></div>
                <div class="info-line"><strong>Email:</strong> <span>thehomeopatha@gmail.com</span></div>
            </div>
            <div class="info-column">
                <div class="section-title">Bill To</div>
                <div class="company-name">${customerName}</div>
                <div class="info-line"><span>${customerAddress}</span></div>
                <div class="info-line"><span>${customerCity}</span></div>
                <div class="info-line"><strong>Email:</strong> <span>${customerEmail}</span></div>
                <div class="info-line"><strong>Phone:</strong> <span>${customerPhone}</span></div>
                ${bd.gstin ? `<div class="info-line"><strong>GSTIN:</strong> <span>${escapeHtml(bd.gstin)}</span></div>` : ""}
                ${bd.accName ? `<div class="info-line"><strong>ACC Name:</strong> <span>${escapeHtml(bd.accName)}</span></div>` : ""}
                ${bd.accNo ? `<div class="info-line"><strong>ACC No:</strong> <span>${escapeHtml(bd.accNo)}</span></div>` : ""}
                ${bd.ifsc ? `<div class="info-line"><strong>IFSC:</strong> <span>${escapeHtml(bd.ifsc)}</span></div>` : ""}
                ${bd.branch ? `<div class="info-line"><strong>Branch:</strong> <span>${escapeHtml(bd.branch)}</span></div>` : ""}
            </div>
        </div>

        <!-- Items Table -->
        <div class="table-section">
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 4%;">#</th>
                        <th style="${hasHsn ? "width: 25%;" : "width: 30%;"}">Product</th>
                        ${hasHsn ? '<th style="width: 10%;">HSN Code</th>' : ""}
                        <th style="width: 6%;">Unit</th>
                        <th style="width: 6%;">Qty</th>
                        <th style="width: 11%;">Unit Price</th>
                        <th style="width: 11%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
            <div class="summary-content">
                <div class="summary-table">
                    <div class="summary-row">
                        <div class="summary-label">Subtotal</div>
                        <div class="summary-value">&#8377; ${itemsSubtotal.toFixed(2)}</div>
                    </div>
                    ${hasGst ? `
                    <div class="summary-row">
                        <div class="summary-label">TAX (CGST)</div>
                        <div class="summary-value">&#8377; ${totalCgstAmount.toFixed(2)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">TAX (SGST)</div>
                        <div class="summary-value">&#8377; ${totalSgstAmount.toFixed(2)}</div>
                    </div>` : `
                    <div class="summary-row">
                        <div class="summary-label" style="font-size: 9pt; color: #666;">No tax applied</div>
                        <div class="summary-value"></div>
                    </div>`}
                    <div class="summary-row">
                        <div class="summary-label">Shipping</div>
                        <div class="summary-value">&#8377; ${shippingCharges.toFixed(2)}</div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-label">TOTAL</div>
                        <div class="summary-value">&#8377; ${totalAmount.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>

        ${gstTableHTML}

        <!-- Amount in Words -->
        <div class="amount-words-row">
            <div class="label">Amount Chargeable (in words):</div>
            <div class="value">${escapeHtml(amountInWords)}</div>
            ${hasGst ? `<div class="label" style="margin-top:6px;">Tax Amount (in words): <strong>${escapeHtml(numberToWords(totalCgstAmount + totalSgstAmount))}</strong></div>` : ""}
        </div>

        <!-- Footer: Payment Info and Notes -->
        <div class="footer-row">
            <div class="payment-section">
                <div class="footer-title">Payment Information</div>
                <div class="footer-content">
                    <div class="info-line"><strong>Method:</strong> ${paymentMethodText}</div>
                    <div class="info-line"><strong>Status:</strong> <span class="status-badge status-${order.paymentStatus}">${paymentStatusText}</span></div>
                    ${order.paymentDetails?.razorpayPaymentId ? `<div class="info-line" style="margin-top: 8px;"><strong>Payment ID:</strong><br><span style="font-family: monospace; font-size: 10pt;">${escapeHtml(order.paymentDetails.razorpayPaymentId)}</span></div>` : ""}
                    <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #ddd;">
                        <div class="info-line"><strong>ACC Name:</strong> MAHADEV AND SONS TRADING COMPANY</div>
                        <div class="info-line"><strong>ACC No:</strong> 04650410000199</div>
                        <div class="info-line"><strong>IFSC:</strong> UCBA0000465</div>
                        <div class="info-line"><strong>Branch:</strong> Nagaur, Rajasthan</div>
                    </div>
                </div>
            </div>
            <div class="notes-section">
                <div class="footer-title">Notes</div>
                <div class="footer-content">
                    Thank you for your order! If you have any questions about this invoice, please contact our support team.
                    <br><br>
                    <em style="font-size: 9pt; color: #666;">This is a computer-generated invoice and does not require a signature.</em>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

module.exports = { generateInvoiceHTML, numberToWords };
