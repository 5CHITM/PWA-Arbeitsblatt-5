const express = require('express');
const asyncHandler = require('express-async-handler');
const webpush = require('web-push');
require('dotenv').config();

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

const { getEmployees, delEmployee, addEmployee } = require('../model/employees');

const subscription = [];

const router = express.Router();

webpush.setVapidDetails('mailto:lang.s03@htlwienwest.at', publicVapidKey, privateVapidKey);

router.get(
  '/employees',
  asyncHandler(async (req, res) => {
    res.json(getEmployees());
  }),
);

router.delete(
  '/employee/:id',
  asyncHandler(async (req, res) => {
    res.status(200).send(delEmployee(req.params.id));
  }),
);

router.post(
  '/employee/',
  asyncHandler(async (req, res) => {
    res.status(200).send(addEmployee(req.body));
  }),
);

router.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    subscription.push(req.body);
    res.status(201).end();
  }),
);

router.post('/notify', (req) => {
  const payload = JSON.stringify({ title: 'Push Test', body: req.body });
  for (const sub of subscription) {
    try {
      webpush.sendNotification(sub, payload);
    } catch (error) {
      console.error(error);
    }
  }
});

module.exports = router;
