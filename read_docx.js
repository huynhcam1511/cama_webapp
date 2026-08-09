const mammoth = require("mammoth");
const fs = require("fs");

mammoth.extractRawText({path: "C:\\Users\\ADMIN-PC\\Documents\\ANTIGRAVITY\\CAMA\\ANH HÙNG CAMA 5.6.docx"})
    .then(function(result){
        var text = result.value; 
        console.log(text.substring(0, 10000));
    })
    .catch(function(error) {
        console.error(error);
    });
