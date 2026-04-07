// server-side 

//tải nodemon

//npm i express-generator
//sudo (khi nó báo không quyền)
//express -- view=ejs --git (tạo gitignore)


//nhắn cho mẹ là hôm nay giá vàng lên 19 rồi

// THƯ VIỆN
let fs = require('fs');
let data = fs.readFileSync('./db.json', { encoding: 'utf8' })

console.log(data);


const server = Http2ServerRequest.createServer((req, res) => {
    if (req.url.includes('/about')) {
        console.log("tôi đang ở trang home")
    } else (
        console.log("Lỗi 404")
    )
    res.writeHead(200, { "Content-type": "text/html" });
    res.write('Hello World');
    res.end('bye')
})



// function ReadFileAndRes(re)