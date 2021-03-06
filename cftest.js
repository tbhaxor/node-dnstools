/**
 * @file cftest.js
 * @description Chinese Firewall Test
 *
 * @author Gurkirat Singh <tbhaxor[at]gmail.com>
 *
 */
const https = require("https");
module.exports = function CFTest(host, callback) {
    let url = `https://viewdns.info/chinesefirewall/?domain=${host}`;

    https
        .get(url, res => {
            res.setEncoding("utf8"); // setting response text encoding

            let body = ""; // inititializing body

            res.on("data", chunk => {
                // collecting chunks
                body += chunk;
            });

            res.on("error", e => {
                // handling error while reading response
                return callback(e, null);
            });

            res.on("end", () => {
                // validate and return data on end of response read
                try {
                    // performing the magic
                    let d = [];
                    body
                        .split("<table border=\"1\">")[1]
                        .split("</table>")[0]
                        .split("<tr><td>")
                        .splice(1)
                        .forEach(entry => {
                            const _entry = /\/images\/ok/.test(entry) ?
                                entry
                                    .replace(
                                        "<img src=\"/images/ok.GIF\" height=\"20\" alt=\"ok\">",
                                        false
                                    )
                                    .replace("<center>", "")
                                    .replace("</center></td></tr>", "")
                                    .replace("<br>", "")
                                    .split("</td><td>") :
                                entry
                                    .replace(
                                        "<img src=\"/images/error.GIF\" height=\"20\" alt=\"fail\">",
                                        true
                                    )
                                    .replace("<center>", "")
                                    .replace("</center></td></tr>", "")
                                    .replace("<br>", "")
                                    .split("</td><td>");
                            d.push({
                                location: _entry[0].trim(),
                                lookupResult: _entry[1].trim(),
                                isBlocked: _entry[2] == "false" ? false : true
                            });
                        });

                    return callback(null, d);
                } catch (e) {
                    // handling the error
                    return callback(e, null);
                }
            });
        })
        .on("error", e => {
            // return error callback if error related to firing requests
            return callback(e, null);
        });
};