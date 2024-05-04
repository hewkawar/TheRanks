const fs = require("fs");
const path = require('path');
const archiver = require('archiver');

const JavaConfig = require("../configs/java.config.json");

if (!fs.existsSync("dist/")) fs.mkdirSync("dist/", { recursive: true });

function copyFolderSync(src, dest) {
    if (!fs.existsSync(src)) return false;
    if (!fs.lstatSync(src).isDirectory()) return false;

    fs.mkdirSync(dest, { recursive: true });

    const files = fs.readdirSync(src);

    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

function BuildJava() {
    JavaConfig.versions.forEach((version) => {
        const output = fs.createWriteStream(`dist/TheRanks-${version.release}.zip`);
    
        const packMeta = {
            "pack": {
                "description": `§fHewkawAr/TheRanks\n§7Version : §a${version.release}`,
                "pack_format": version.pack
            }
        };
    
        copyFolderSync("resourcepack/assets", `build/building/${version.pack}/assets`);
        fs.copyFileSync("resourcepack/pack.png", `build/building/${version.pack}/pack.png`);
        fs.writeFileSync(`build/building/${version.pack}/pack.mcmeta`, JSON.stringify(packMeta, null, 2));
    
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
    
        archive.pipe(output);
    
        archive.directory(`build/building/${version.pack}`, false);
    
        archive.finalize();
    
        output.on('close', function() {
            console.log(`Builded Java for Version ${version.release}`);
        });
    });
}

function BuildBedrock() {
    const output = fs.createWriteStream(`dist/TheRanks-Bedrock.mcpack`);

    copyFolderSync("mcpack", `build/building/bedrock`);

    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.pipe(output);

    archive.directory("build/building/bedrock", false);

    archive.finalize();

    output.on('close', function() {
        console.log("Builded Bedrock Version");
    });
}

BuildJava();
BuildBedrock();