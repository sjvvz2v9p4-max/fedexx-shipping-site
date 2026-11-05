import { getStore } from "@netlify/blobs";

const store = getStore({ name: "fedexx-shipments", consistency: "strong" });
const json = (data, status=200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store" }
});
const clean = (v, max=500) => String(v ?? "").trim().slice(0,max);
const allowedStatuses = ["Shipment registered","Processing","In transit","Arrived at facility","Out for delivery","Delivered","On hold","Delivery exception"];
function authorised(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 16) return false;
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i,"");
  return token.length === expected.length && token === expected;
}
async function readShipment(code) { return await store.get(code, { type:"json" }); }
async function allShipments() {
  const result = []; let cursor;
  do {
    const page = await store.list({ prefix:"FXX-", cursor, limit:1000 });
    for (const item of page.blobs) {
      const data = await readShipment(item.key);
      if (data) result.push(data);
    }
    cursor = page.cursor;
  } while (cursor);
  return result.sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
}
function publicRecord(s) {
  return { code:s.code, description:s.description, status:s.status, location:s.location,
    eta:s.eta, history:(s.history||[]).map(h=>({status:h.status,location:h.location,note:h.note,at:h.at})) };
}
export default async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";
  try {
    if (action === "track" && req.method === "GET") {
      const code = clean(url.searchParams.get("code"),40).toUpperCase();
      if (!/^FXX-\d{8}-[A-Z0-9]{6}$/.test(code)) return json({error:"Please enter a valid Fedexx tracking code."},400);
      const shipment = await readShipment(code);
      if (!shipment) return json({error:"No shipment record was found for that tracking code."},404);
      return json({shipment:publicRecord(shipment)});
    }
    if (!authorised(req)) return json({error:"Access denied. Check the private admin password configured in Netlify."},401);
    if (action === "list" && req.method === "GET") return json({shipments:await allShipments()});
    if (req.method !== "POST") return json({error:"Method not allowed."},405);
    const body = await req.json();
    if (action === "create") {
      const senderName=clean(body.senderName,100), receiverName=clean(body.receiverName,100), description=clean(body.description,160);
      if (!senderName || !receiverName || !description) return json({error:"Sender, receiver and package description are required."},400);
      const now = new Date(), date = now.toISOString().slice(0,10).replace(/-/g,"");
      let code;
      do { code=`FXX-${date}-${Array.from({length:6},()=> "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*32)]).join("")}`; } while (await readShipment(code));
      const status=allowedStatuses.includes(body.status)?body.status:"Shipment registered";
      const shipment={code,senderName, senderPhone:clean(body.senderPhone,40),senderAddress:clean(body.senderAddress,300),
        receiverName,receiverPhone:clean(body.receiverPhone,40),receiverAddress:clean(body.receiverAddress,300),
        description,weight:clean(body.weight,20),fee:clean(body.fee,20),currency:clean(body.currency,5)||"USD",
        status,location:clean(body.location,120),eta:clean(body.eta,20),createdAt:now.toISOString(),
        history:[{status,location:clean(body.location,120),note:clean(body.note,500),at:now.toISOString()}]};
      await store.setJSON(code,shipment); return json({shipment},201);
    }
    if (action === "update") {
      const code=clean(body.code,40).toUpperCase(), old=await readShipment(code);
      if (!old) return json({error:"Shipment record not found."},404);
      const status=allowedStatuses.includes(body.status)?body.status:old.status;
      const location=clean(body.location,120), eta=clean(body.eta,20), note=clean(body.note,500);
      const changed=status!==old.status || location!==old.location || note!=="";
      const updated={...old,senderName:clean(body.senderName,100)||old.senderName,
        senderPhone:clean(body.senderPhone,40),senderAddress:clean(body.senderAddress,300),
        receiverName:clean(body.receiverName,100)||old.receiverName,receiverPhone:clean(body.receiverPhone,40),
        receiverAddress:clean(body.receiverAddress,300),description:clean(body.description,160)||old.description,
        weight:clean(body.weight,20),fee:clean(body.fee,20),currency:clean(body.currency,5)||old.currency,
        status,location,eta,updatedAt:new Date().toISOString()};
      if (changed) updated.history=[...(old.history||[]),{status,location,note,at:updated.updatedAt}];
      await store.setJSON(code,updated); return json({shipment:updated});
    }
    if (action === "delete") {
      const code=clean(body.code,40).toUpperCase();
      if (!await readShipment(code)) return json({error:"Shipment record not found."},404);
      await store.delete(code); return json({deleted:true});
    }
    return json({error:"Unknown action."},404);
  } catch (error) {
    console.error("Fedexx API error:",error);
    return json({error:"The server could not complete this request. Please try again."},500);
  }
};
