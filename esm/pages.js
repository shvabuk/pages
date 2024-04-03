import fs from 'node:fs';
import path from 'node:path';
import Twig from 'twig';
import pretty from 'pretty';


export default class Pages {

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
        };

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
