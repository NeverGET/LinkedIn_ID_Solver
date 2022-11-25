import express from "express";
import axios from "axios";
import {parse} from "node-html-parser"
import {unescape} from 'html-escaper';

export default class check_id extends express.Router {
    constructor(props) {
        super(props);
        this.linkedInLinks = {industry: "https://learn.microsoft.com/en-us/linkedin/shared/references/reference-tables/industry-codes"}

        this.findByID = async function (id, url) {
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
        this.callback = function (self) {
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
                let idPromises = keys.map(value => {
                    return self.findByID(value.value, self.linkedInLinks[value.key]).then(value1 => {
                        return value1;
                    });
                })
                Promise.all(idPromises).then(results => {
                    res.status(200).json(results);
                });

            }
        }
        this.get(`/`, this.callback(this));
    }


}
