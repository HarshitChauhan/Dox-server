const express = require("express");
const router = express.Router();

router.get('/', (req, res)=>{
    res.send('Dox server is up and running!!!');
});

module.exports = router;