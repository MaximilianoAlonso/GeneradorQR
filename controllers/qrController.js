const qr = require("qrcode");
const fs = require("fs");

// Importar el módulo uuid
function generarUUIDNumerico() {
  let uuid = "";
  for (let i = 0; i < 12; i++) {
    uuid += Math.floor(Math.random() * 10); // Genera un número aleatorio entre 0 y 9
  }
  return uuid;
}

// Generar un UUID
const id = generarUUIDNumerico();

module.exports = {
  crearQr: (req, res) => {
   
    res.render("generarQr", {
      id,
    });
  },
  generarQr: (req, res) => {
    const { nombre, apellido, telefono, email, descripcion, estado } = req.body;

    const data = `https://generadorqr-clubx.onrender.com/VerDetallesQr/${id}`;

    const options = {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    };

    qr.toFile(`./qr${id}.png`, data, options, function (err) {
      if (err) {
        console.error("Error al generar el QR:", err);
        res.status(500).send("Error interno al generar el QR.");
        return;
      }
      console.log("QR generado correctamente.");

      fs.readFile("./data/data.json", "utf8", function (err, jsonString) {
        if (err) {
          console.error("Error al leer los datos:", err);
          res.status(500).send("Error interno al leer los datos.");
          return;
        }

        let jsonData = [];
        if (jsonString) {
          jsonData = JSON.parse(jsonString);
        }

        jsonData.push({
          id,
          nombre,
          apellido,
          telefono,
          email,
          descripcion,
          estado,
        });

        fs.writeFile(
          "./data/data.json",
          JSON.stringify(jsonData, null, 2),
          function (err) {
            if (err) {
              console.error("Error al guardar los datos:", err);
              res.status(500).send("Error interno al guardar los datos.");
              return;
            }
            console.log("Datos guardados correctamente.");

            res.download(`./qr${id}.png`, `qr${id}.png`, function (err) {
              if (err) {
                console.error("Error al descargar el QR:", err);
                res.status(500).send("Error interno al descargar el QR.");
                return;
              }
              console.log("QR descargado correctamente.");
            });
          }
        );
      });
    });
  },
  mostrarQr: (req, res) => {
    fs.readFile("./data/data.json", "utf8", function (err, jsonString) {
      if (err) {
        console.error("Error al leer los datos:", err);
        res.status(500).send("Error interno al leer los datos.");
        return;
      }
      const datos = JSON.parse(jsonString);
      const buscar = datos.find((user) => user.id == req.params.id);
      if (buscar) {
        res.render("verDetallesQr", {
          id: buscar.id,
          nombre: buscar.nombre,
          apellido: buscar.apellido,
          telefono: buscar.telefono,
          descripcion: buscar.descripcion,
          email: buscar.email,
          estado: buscar.estado, // Asegúrate de incluir estado en el objeto que pasas a la plantilla
        });
      } else {
        res.status(404).send("Usuario no encontrado");
      }
    });
  },
  caducarqr: (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, telefono, email, descripcion, estado } = req.body;

    fs.readFile("./data/data.json", "utf8", function (err, jsonString) {
      if (err) {
        console.error("Error al leer los datos:", err);
        res.status(500).send("Error interno al leer los datos.");
        return;
      }

      let jsonData = [];
      if (jsonString) {
        jsonData = JSON.parse(jsonString);
      }

      const indice = jsonData.findIndex((item) => item.id === id);
      if (indice !== -1) {
        // Modificar los datos del objeto encontrado
        jsonData[indice].nombre = nombre;
        jsonData[indice].apellido = apellido;
        jsonData[indice].telefono = telefono;
        jsonData[indice].email = email;
        jsonData[indice].descripcion = descripcion;
        jsonData[indice].estado = estado;

        fs.writeFile(
          "./data/data.json",
          JSON.stringify(jsonData, null, 2),
          function (err) {
            if (err) {
              console.error("Error al guardar los datos:", err);
              res.status(500).send("Error interno al guardar los datos.");
              return;
            }
            console.log("Datos modificados correctamente.");
            res.redirect("/verDetallesQr/" + id);
          }
        );
      } else {
        console.log("No se encontró ningún objeto con el ID especificado.");
        res
          .status(404)
          .send("No se encontró ningún objeto con el ID especificado.");
      }
    });
  },
};
