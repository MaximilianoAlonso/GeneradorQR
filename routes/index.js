const express = require('express');
const router = express.Router();
const qr = require('qrcode');
const fs = require('fs');


/* GET home page. */
router.get("/", (req, res) => {
    res.render("index");
});
/* -----------------------------------------MOSTRAR ESTADO Y DATOS */
router.get("/verificado/:id", (req, res) => {
    fs.readFile('./data/data.json', 'utf8', function (err, jsonString) {
        if (err) {
            console.error('Error al leer los datos:', err);
            res.status(500).send('Error interno al leer los datos.');
            return;
        }
        const datos = JSON.parse(jsonString);
        const buscar = datos.find(user => user.id == req.params.id);
        if (buscar) {
            res.render("verificado", { 
              id:buscar.id,
                nombre: buscar.nombre,
                apellido: buscar.apellido,
                telefono: buscar.telefono,
                descripcion: buscar.descripcion,
                email: buscar.email,
                estado: buscar.estado // Asegúrate de incluir estado en el objeto que pasas a la plantilla
            });
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    });
});
/* -----------------------------------------CAMBIAR ESTADO */
router.post('/verificado/:id', (req, res) => {
  const id = req.params.id;
  const { nombre, apellido, telefono, email, descripcion, estado } = req.body;

  fs.readFile('./data/data.json', 'utf8', function (err, jsonString) {
      if (err) {
          console.error('Error al leer los datos:', err);
          res.status(500).send('Error interno al leer los datos.');
          return;
      }

      let jsonData = [];
      if (jsonString) {
          jsonData = JSON.parse(jsonString);
      }

      const indice = jsonData.findIndex(item => item.id === id);
      if (indice !== -1) {
          // Modificar los datos del objeto encontrado
          jsonData[indice].nombre = nombre;
          jsonData[indice].apellido = apellido;
          jsonData[indice].telefono = telefono;
          jsonData[indice].email = email;
          jsonData[indice].descripcion = descripcion;
          jsonData[indice].estado = estado;

          fs.writeFile('./data/data.json', JSON.stringify(jsonData, null, 2), function (err) {
              if (err) {
                  console.error('Error al guardar los datos:', err);
                  res.status(500).send('Error interno al guardar los datos.');
                  return;
              }
              console.log('Datos modificados correctamente.');
              res.status(200).send('Datos modificados correctamente.');
          });
      } else {
          console.log('No se encontró ningún objeto con el ID especificado.');
          res.status(404).send('No se encontró ningún objeto con el ID especificado.');
      }
  });
});

 
/*----------------------------------------- GUARDAR  */
router.post('/', (req, res) => {
    const { nombre, apellido, telefono, email, descripcion, estado } = req.body;
    const id = Date.now().toString();

    const data = `http://localhost:3000/verificado/${id}`;

    const options = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    };

    qr.toFile(`./qr${id}.png`, data, options, function (err) {
        if (err) {
            console.error('Error al generar el QR:', err);
            res.status(500).send('Error interno al generar el QR.');
            return;
        }
        console.log('QR generado correctamente.');

        fs.readFile('./data/data.json', 'utf8', function (err, jsonString) {
            if (err) {
                console.error('Error al leer los datos:', err);
                res.status(500).send('Error interno al leer los datos.');
                return;
            }

            let jsonData = [];
            if (jsonString) {
                jsonData = JSON.parse(jsonString);
            }

            jsonData.push({ id, nombre, apellido, telefono, email, descripcion, estado });

            fs.writeFile('./data/data.json', JSON.stringify(jsonData, null, 2), function (err) {
                if (err) {
                    console.error('Error al guardar los datos:', err);
                    res.status(500).send('Error interno al guardar los datos.');
                    return;
                }
                console.log('Datos guardados correctamente.');

                res.download(`./qr${id}.png`, `qr${id}.png`, function (err) {
                    if (err) {
                        console.error('Error al descargar el QR:', err);
                        res.status(500).send('Error interno al descargar el QR.');
                        return;
                    }
                    console.log('QR descargado correctamente.');
                });
            });
        });
    });
});

module.exports = router;
