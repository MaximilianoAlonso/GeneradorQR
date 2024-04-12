const express = require('express');
const router = express.Router();
const {generarQr, mostrarQr, caducarqr, crearQr} = require("../controllers/qrController")


/* QR */
/* generar */
router.get("/generarQr", crearQr)

 /* guardar */
    .post('/generarQr', generarQr)

/* mostrar */
    .get("/VerDetallesQr/:id", mostrarQr)

/* caducar */
    .post('/VerDetallesQr/:id', caducarqr)




module.exports = router;
