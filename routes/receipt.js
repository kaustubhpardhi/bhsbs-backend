const router = require("express").Router();
const receiptController = require("../controllers/receiptController");
const userAuth = require("../middlewares/userAuth");

router.post("/create-receipt", receiptController.createReceipt);
router.get("/check-pawati-number", receiptController.checkReceipt);
router.post("/get-receipt", receiptController.getReceipt);
router.get("/get-total-amount", receiptController.getSumAmount);
router.get("/get-cash-amount", receiptController.getCashAmount);
router.get("/get-dd-amount", receiptController.getDDAmount);
router.get("/get-online-amount", receiptController.getOnlineAmount);
router.get("/download-receipts", receiptController.downloadExcel);
router.post("/create-order", receiptController.createOrder);
module.exports = router;
