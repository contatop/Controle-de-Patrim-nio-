document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('patrimonio-form');
    const tableBody = document.querySelector('#patrimonio-table tbody');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const item = document.getElementById('item').value;
        const valor = document.getElementById('valor').value;
        const dataAquisicao = document.getElementById('data-aquisicao').value;
        const imageUrl = document.getElementById('image-url').value;

        if (item && valor && dataAquisicao) {
            addItemToTable(item, valor, dataAquisicao, imageUrl);
            form.reset();
        }
    });

    function addItemToTable(item, valor, dataAquisicao, imageUrl) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${item}</td>
            <td>${valor}</td>
            <td>${dataAquisicao}</td>
            <td><img src="${imageUrl}" alt="${item}"></td>
            <td><button class="action-btn" onclick="removeItem(this)">Remover</button></td>
            <td class="qr-container" id="qrcode-${item}">
                <div class="qr-code" id="qr-${item}"></div>
            </td>
        `;

        tableBody.appendChild(row);

        generateQRCode(`qr-${item}`, `${item}, ${valor}, ${dataAquisicao}`);
    }

    function generateQRCode(elementId, text) {
        const qrCodeContainer = document.getElementById(elementId);
        qrCodeContainer.innerHTML = ''; // Clear previous QR code
        const qr = new QRCode(qrCodeContainer, {
            text: text,
            width: 128,
            height: 128,
            correctLevel: QRCode.CorrectLevel.L // Set error correction level
        });

        // Ensure QR code is fully generated before adding text
        setTimeout(() => {
            const canvas = qrCodeContainer.querySelector('canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.font = 'bold 20px Arial';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('1', canvas.width / 2, canvas.height / 2);
            }
        }, 100);
    }

    function downloadQRCode(itemName) {
        const canvas = document.querySelector(`#qr-${itemName} canvas`);
        if (canvas) {
            // Ensure that the QR code is fully rendered
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${itemName}.png`;
            link.click();
        } else {
            alert('QR Code não gerado corretamente.');
        }
    }

    window.removeItem = function(button) {
        const row = button.parentNode.parentNode;
        row.remove();
    }

    window.downloadAllQRCodes = async function() {
        const zip = new JSZip();
        const qrCodes = document.querySelectorAll('.qr-code');

        for (const qrCode of qrCodes) {
            const canvas = qrCode.querySelector('canvas');
            if (canvas) {
                const dataURL = canvas.toDataURL('image/png');
                const response = await fetch(dataURL);
                const blob = await response.blob();
                const itemName = qrCode.parentElement.id.replace('qrcode-', '');
                zip.file(`${itemName}.png`, blob);
            }
        }

        zip.generateAsync({ type: 'blob' })
            .then(function(content) {
                saveAs(content, 'qrcodes.zip');
            });
    }
});
