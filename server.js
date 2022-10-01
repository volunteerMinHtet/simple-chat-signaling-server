import http from "http";
import websocket from "websocket";

const indexPage = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body><h1>Hello</h1></body></html>`;

const PORT = process.env.PORT || 8080;

const httpServer = http.createServer((req, res) => {
  console.log(new Date() + " Received request for " + req.url);
  res.writeHead(200);
  res.end(indexPage);
});

httpServer.listen(PORT, () => {
  console.log(`Http Server listening at port ${PORT}`);
});

const WebSocketServer = websocket.server;
const wsServer = new WebSocketServer({ httpServer: httpServer });

let clients = [];

wsServer.on("request", (request) => {
  const connection = request.accept();
  const id = Math.floor(Math.random() * 100);

  clients.forEach((client) =>
    client?.connection?.send(
      JSON.stringify({ client: id, text: `A new user connected (ID - ${id})` })
    )
  );

  clients.push({ connection, id });

  connection.on("message", (message) => {
    console.log(message);
    clients
      .filter((client) => client?.id !== id)
      .forEach((client) => client?.connection?.send(message.utf8Data));
  });

  connection.on("close", () => {
    clients = clients.filter((client) => client.id !== id);
    clients.forEach((client) =>
      client.connection.send(
        JSON.stringify({
          client: id,
          text: `(ID - ${id}) User disconnected`,
        })
      )
    );
  });
});
