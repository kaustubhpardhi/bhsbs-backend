const Receipt = require("../models/receiptModel");
const mongoose = require("mongoose");
const excelJS = require("exceljs");
const secret =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbmNyeXB0VGV4dCI6IjVhODgzNmRjLTUwMzgtNGVlNi05NjdkLTVmMjcxNzgzNGY4OSJ9.pXPtH0xCu5b3EDFAAYU_HIfOW9mgVvwE_QGmP4D7IkI";
const merchankKey = "nAHUtRh3tRVn/YhIFWQW448Co0E1EQjAMppR8gMwbqs=";
const userIdSecret = "HiktfH0Mhdla4zDg0/4ASwFQh2OS+nf9MVL0ik3DsmE=";
var jwt = require("jsonwebtoken");
const { default: axios } = require("axios");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");

const receiptController = {
  //Cheack Receipt Extistence

  checkReceipt: async (req, res) => {
    try {
      const checklastPawati = await Receipt.find()
        .sort({ pawatiNumber: -1 })
        .limit(1);
      res.status(200).send(checklastPawati);
    } catch (e) {
      res.status(400).send({ message: e.message });
    }
  },
  //Create Receipt

  createReceipt: async (req, res) => {
    try {
      const {
        pawatiNumber,
        receiptDate,
        Name,
        month,
        email,
        mobileNumber,
        address,
        purpose,
        amount,
        // gotra,
        poojaDate,
        modeOfPayment,
        uid,
        uidType,
      } = req.body;
      const section = "Section 80G";
      const urn = "AACTB6420HE20211";
      const urnDate = "06-04-2022";
      const donationType = "Specific Grant";

      const checkExistence = await Receipt.find({
        pawatiNumber: pawatiNumber,
      }).exec();
      if (checkExistence.length === 1) {
        return res
          .status(400)
          .send({ message: "Pawati Number already exist!" });
      } else {
        const newReceipt = new Receipt({
          pawatiNumber: pawatiNumber,
          receiptDate: receiptDate,
          Name: Name,
          month: month,
          // gotra: gotra,
          poojaDate: poojaDate,
          email: email,
          mobileNumber: mobileNumber,
          address: address,
          purpose: purpose,
          amount: amount,
          modeOfPayment,
          uid: uid,
          uidType: uidType,
          section: section,
          urn: urn,
          urnDate: urnDate,
          donationType: donationType,
        });
        await newReceipt.save();
        res.status(200).send({ message: "Receipt Saved Successfully" });
      }
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  },

  //Get Package

  getReceipt: async (req, res) => {
    try {
      const { page, count } = req.body;
      const packages = await Receipt.find()
        .skip((page - 1) * count)
        .limit(count)
        .sort({ createdAt: -1 })
        .exec();
      res.status(200).send({ packages });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  //Get Sum Amount

  getSumAmount: async (req, res) => {
    try {
      const totalSum = await Receipt.aggregate([
        { $group: { _id: null, sum_val: { $sum: "$amount" } } },
      ]);
      res.status(200).send({ Total_Amount: totalSum[0].sum_val });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  //Get Sum Amount

  getOnlineAmount: async (req, res) => {
    try {
      const totalSum = await Receipt.aggregate([
        { $group: { _id: null, sum_val: { $sum: "$modeOfPayment.Online" } } },
      ]);
      res.status(200).send({ Total_Amount: totalSum[0].sum_val });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  //Get DD Amount

  getDDAmount: async (req, res) => {
    try {
      const totalSum = await Receipt.aggregate([
        { $group: { _id: null, sum_val: { $sum: "$modeOfPayment.ChequeDD" } } },
      ]);
      res.status(200).send({ Total_Amount: totalSum[0].sum_val });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  //Get Sum Amount

  getCashAmount: async (req, res) => {
    try {
      const totalSum = await Receipt.aggregate([
        { $group: { _id: null, sum_val: { $sum: "$modeOfPayment.Cash" } } },
      ]);
      res.status(200).send({ Total_Amount: totalSum[0].sum_val });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  downloadExcel: async (req, res) => {
    try {
      await Receipt.find({}).then((data) => {
        res.json(data);
      });
    } catch (e) {
      res.status(400).send({ message: e.message });
    }
  },
  // Delete Package

  deletePackage: async (req, res) => {
    try {
      const { packageId } = req.body;
      const package = await Package.findByIdAndRemove({
        _id: packageId,
      }).exec();
      res.status(200).send({ message: package });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  //Get Package By Id

  getPackageById: async (req, res) => {
    try {
      const packageId = req.params.id;
      const package = await Package.find({ _id: packageId }).exec();
      res.status(200).send({ package });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  // Create Package Request

  createPackageRequest: async (req, res) => {
    try {
      const {
        status,
        packageId,
        startDate,
        endDate,
        numberOfPeople,
        location,
        userId,
      } = req.body;

      const newRequest = new Request({
        status: status,
        packageId: packageId,
        startDate: startDate,
        endDate: endDate,
        numberOfPeople: numberOfPeople,
        location: location,
        RequestedBy: userId,
      });
      await newRequest.save();
      res.status(200).send({
        message:
          "Your request is placed successfully we will connect you soon.",
      });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  //Update Package Request

  updatePackageRequest: async (req, res) => {
    try {
      const {
        status,
        packageId,
        startDate,
        endDate,
        numberOfPeople,
        resorts,
        roomType,
        mealPlan,
        transfers,
        inclusion,
        itinerary,
        price,
        flightDetails,
      } = req.body;
      const package = await Request.updateOne(
        { _id: mongoose.Types.ObjectId(packageId) },
        {
          status: status,
          startDate: startDate,
          endDate: endDate,
          numberOfPeople: numberOfPeople,
          resorts: resorts,
          roomType: roomType,
          mealPlan: mealPlan,
          transfers: transfers,
          inclusion: inclusion,
          itinerary: itinerary,
          price: price,
          flightDetails: flightDetails,
        }
      ).exec();
      res.status(200).send({ message: package });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  //Get Package Request for Admin

  getAllRequests: async (req, res) => {
    try {
      const requests = await Request.find({}).exec();
      res.status(200).send({ requests });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  // Get All request by userId

  getPackageRequestByUser: async (req, res) => {
    try {
      const { userId } = req.body;
      const requests = await Request.find({ RequestedBy: userId }).exec();
      res.status(200).send({ requests });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  //Delete Package Request By Id

  deletePackageRequest: async (req, res) => {
    try {
      const { packageRequestId } = req.body;
      const packageRequest = await Request.findByIdAndRemove({
        _id: mongoose.Types.ObjectId(packageRequestId),
      }).exec();
      res.status(200).send({ packageRequest });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  },

  //Search Packages

  searchPackages: async (req, res) => {
    try {
      const { text } = req.body;
      const packages = await Package.find({
        $or: [
          {
            packageTitle: {
              $regex: text.localeCompare({ sensitivity: "accent" }),
            },
          },
        ],
      });
      res.status(200).send({ packages });
    } catch (e) {
      res.status(400).send({ message: e.message });
    }
  },

  //Create Order

  createOrder: async (req, res) => {
    try {
      const {
        fName,
        lName,
        orderId,
        mediaType,
        amount,
        product,
        date,
        country,
        currency,
        customerEmail,
        mobileNo,
      } = req.body;
      console.log(req.body);
      const productinfo = "Billing";
      const salt = "DAH88E3UWQ";
      const key = "2PBP7IABZ2";
      // stringAmount = amount.toString();
      floatAmount = parseFloat(amount).toFixed(2);
      console.log(floatAmount);
      const str = `${key}|${orderId}|${[
        floatAmount,
      ]}|${productinfo}|${fName}|${customerEmail}|||||||||||${salt}`;

      const hashFunction = (str) => {
        // Create a new hash object
        const hash = crypto.createHash("sha512");

        // Update the hash with the input string
        hash.update(str);

        // Return the hashed value of the input string
        return hash.digest("hex");
      };
      const hashSequence = hashFunction(str);

      const params = new URLSearchParams();
      params.append("key", key);
      params.append("txnid", orderId);
      params.append("amount", [floatAmount]);
      params.append("productinfo", productinfo);
      params.append("firstname", fName);
      params.append("phone", mobileNo);
      params.append("email", customerEmail);
      params.append(
        "surl",
        "https://billing-software-frontend.vercel.app/success"
      );
      params.append(
        "furl",
        "https://billing-software-frontend.vercel.app/failed"
      );
      params.append("hash", hashSequence);

      const data = {
        key: key,
        txnid: orderId,
        amount: [floatAmount],
        productinfo: productinfo,
        firstname: fName,
        phone: mobileNo,
        email: customerEmail,
        surl: "https://billing-software-frontend.vercel.app/success",
        furl: "https://billing-software-frontend.vercel.app/failed",
        hash: hashSequence,
      };
      axios
        .post("https://testpay.easebuzz.in/payment/initiateLink", params)
        .then((data) => {
          console.log(data);
          res.status(200).send({ message: "sucess" });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: err.message });
    }
  },
};

module.exports = receiptController;
