//const express = require('express');
import express from "express";
import check_id from "./check_id.js";

export default class App extends express{
    constructor() {
        super();

        this.check_id = new check_id();
        this.use('/check_id', this.check_id);
        this.port = process.env.PORT || 5500;
        this.listen(this.port, () => console.log(`Listening on Port: ${this.port}`));
    }
}
