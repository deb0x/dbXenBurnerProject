const fs = require('fs');
const path = require('path');

// Path to your local folder
const directoryPath = '';
// Change this to the file extension of your images
const fileExtension = '';

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    let count = 1;

    files
        .filter((file) => path.extname(file) === fileExtension)
        .forEach((file) => {
            const oldPath = path.join(directoryPath, file);
            const newName = `image_${count}${fileExtension}`;
            const newPath = path.join(directoryPath, newName);

            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.error(`Error renaming ${file}:`, err);
                } else {
                    console.log(`Renamed ${file} to ${newName}`);
                }
            });

            count++;
        });
});