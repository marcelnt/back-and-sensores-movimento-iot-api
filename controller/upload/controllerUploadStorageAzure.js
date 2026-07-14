/***************************************************************************************
 * Objetivo: Arquivo resposnsável por realizar UPLOAD de arquivos na Azure
 * Data: 20/06/2025
 * Autor: Marcel
 * Versão: 1.0
 ***************************************************************************************/

const AZURE = require('../../modulo/configUploadAzure.js')
const fetch = require('node-fetch').default;

//upload da imagem
const uploadFiles = async function (imagem) {

    let fileName = Date.now() + imagem.originalname
    
    let urlPublica  = `https://${AZURE.ACCOUNT}.blob.core.windows.net/${AZURE.CONTAINER}/${fileName}`
    let url         = `${urlPublica}?${AZURE.TOKEN}`

    let resposta = await fetch(url, {
        method: 'PUT',
        headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': 'application/octet-stream'
        },
        body: imagem.buffer
    })
    
    if(resposta.status == 201)
        return urlPublica
    else
        return false
}

const deleteFiles = async function (url){

    const blogName = String(url).split('/')
   
    const xMsDate = new Date().toUTCString(); // Data e hora UTC no formato RFC 1123
    const apiVersion = '2024-07-01'; // Versão da API Azure Storage (use a mais recente recomendada)

    // Cabeçalhos canônicos (ordenados alfabeticamente e em minúsculas)
    const canonicalizedHeaders = `x-ms-date:${xMsDate}\nx-ms-version:${apiVersion}`;

    console.log(canonicalizedHeaders)
    // Recurso canônico
    const canonicalizedResource = `/${AZURE.ACCOUNT}/${AZURE.CONTAINER}/${blogName[4]}`;

    // Note: Para DELETE, contentLength é geralmente 0
    const authorizationHeader = generateSharedKeyLiteSignature(
        'DELETE',
        0, // contentLength
        canonicalizedHeaders,
        canonicalizedResource
    );

    console.log(authorizationHeader)

    let resposta = await fetch(url, {
        method: 'DELETE',
        headers: {
            'x-ms-date': xMsDate,
            'x-ms-version': apiVersion,
            'Authorization': authorizationHeader
        },

            validateStatus: function (status) {
                return status >= 200 && status < 300; // Resolve apenas se o status for 2xx
            }

    })

    console.log(resposta)

    if(resposta.status == 200)
        return true
    else
        return false

}


function generateSharedKeyLiteSignature(verb, contentLength, canonicalizedHeaders, canonicalizedResource) {
    const crypto = require('crypto');
    const stringToSign = [
        verb,                     // Ex: 'DELETE'
        '',                       // Content-Encoding (vazio para blobs, a menos que especificado)
        '',                       // Content-Language (vazio para blobs, a menos que especificado)
        contentLength === 0 ? '' : contentLength.toString(), // Content-Length (vazio se for 0)
        '',                       // Content-MD5 (vazio para DELETE)
        '', // Content-Type (vazio se não houver body, mas bom ter um padrão)
        '',                       // Date (vazio, pois usaremos o cabeçalho x-ms-date)
        '',                       // If-Modified-Since (vazio)
        '',                       // If-Match (vazio)
        '',                       // If-None-Match (vazio)
        '',                       // If-Unmodified-Since (vazio)
        '',                       // Range (vazio)
        canonicalizedHeaders,     // Cabeçalhos x-ms-...
        canonicalizedResource     // Recurso canônico (conta/container/blob)
    ].join('\n');

    const key = Buffer.from(AZURE.ACCOUNT, 'base64');
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(stringToSign, 'utf8');
    const signature = hmac.digest('base64');

    return `SharedKeyLite ${AZURE.ACCOUNT}:${signature}`;
}


module.exports = {uploadFiles, deleteFiles}