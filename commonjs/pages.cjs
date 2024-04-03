/*!
  * A simple html generator class. v1.0.0 (https://github.com/shvabuk/pages)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/pages/blob/master/LICENSE)
  * 
  */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Twig = require('twig');
const pretty = require('pretty');

class Pages {

    #sourceExtension ;
    #destinationExtension ;
    #pattern;

    constructor(sourceExtension = '.twig', destinationExtension = '.html', pattern = false) {
        this.#sourceExtension = sourceExtension;
        this.#destinationExtension = destinationExtension;

        if (pattern) {
            this.#pattern = pattern;
        } else {
            this.#pattern = new RegExp(`^[^_].*\\${sourceExtension}$`);
        }
    }

    run(source, destination, dataCollection = {}) {
        return this.#renderDir(source, source, destination, dataCollection);
    }

    #renderDir(directory, source, destination, dataCollection) {
        if (!fs.existsSync(directory)) {
            throw new Error(`Directory "${directory}" not found.`);
        }
      
        let files = fs.readdirSync(directory);
        let results = [];

        for (let i = 0; i < files.length; i++) {
            let entityPath = path.join(directory, files[i]);
            let stat = fs.lstatSync(entityPath);

            if (stat.isDirectory()) {
                const subFiles = this.#renderDir(entityPath, source, destination, dataCollection);

                results = results.concat(subFiles);
            } else if (stat.isFile() && this.#pattern.test(files[i])) {
                
                let fileName = path.normalize(entityPath.replace(new RegExp(`^[\\\/]*${source}`), destination + path.sep));
                fileName = fileName.replace(new RegExp(`${this.#sourceExtension}$`), this.#destinationExtension);

                const data = (entityPath in dataCollection)? dataCollection.entityPath: {};
                this.renderPage(entityPath, fileName, data);

                results.push(fileName);
            }
        }
        return results;
    }

    renderPage(source, destination, data = {}) {
        Twig.renderFile(source, data, (err, html) => {
            if (err) throw err;

            const dirname = path.dirname(destination);
            this.#createDir(dirname);

            fs.writeFileSync(destination, pretty(html));
        });
    }

    #createDir(dir, recursive = true) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive });
        } else if (!fs.lstatSync(dir).isDirectory()) {
            throw new Error(`"${dir}" is not a directory.`);
        }
    }
}

module.exports = Pages;
