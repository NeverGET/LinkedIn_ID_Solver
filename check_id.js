import express from "express";
import axios from "axios";
import {parse} from "node-html-parser"
import {unescape} from 'html-escaper';

export default class Check_ID extends express.Router {
    constructor(props) {
        super(props);
        this.linkedInLinks = {industry: "https://learn.microsoft.com/en-us/linkedin/shared/references/reference-tables/industry-codes"}
        this.setRoutes();
    }
    setRoutes = ()=>{
        this.get(`/`, this.#getCallback().bind(this));
    }
    #getCallback = ()=>{
        return function (req, res) {
            let keys = req.url.split("?")[1].split("&").filter(value => {
                if (value.indexOf("=") !== -1) {
                    return true;
                }
            });
            keys = keys.map(value => {
                let key = value.split("=");
                return {key: key[0], value: key[1]};
            })
            let idPromises = keys.map(function(value){
                return this.#findByID(value.value, this.linkedInLinks[value.key]).then(value1 => {
                    return value1;
                });
            }, this);
            Promise.all(idPromises).then(results => {
                res.status(200).json(results);
            });

        }
    }
    #findByID = async (id, url) => {
        let htmlObject;
        await axios.get(url).then(function (response) {
            htmlObject = parse(response.data);
        });
        let returnVal = Array.prototype.slice.call(htmlObject.querySelectorAll('table > tbody > tr')).find((value) => {
            let elements = value.querySelectorAll('td');
            if (id === elements[0].rawText) {
                return true;
            }
        })

        return returnVal !== undefined ? {id: id, value: unescape(returnVal.querySelectorAll('td')[2].rawText)} : {
            id: id, value: "-1"
        };
    }


}
