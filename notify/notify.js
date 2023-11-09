
//ส่วนไลน์ API
const request = require('request');
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.TOKEN;
const url_line_notification = "https://notify-api.line.me/api/notify";

//ส่วนยอดขายประจำวัน
const date = new Date();
const day_schema = require("../schema/daily_sales_shema");
const { format, subDays } = require("date-fns");
const currentDate = new Date();
currentDate.setUTCHours(0, 0, 0, 0);

// ส่วนของของใกล้จะหมด
const product_structure = require("../schema/add_product_schema");
lineNotify = async function () {
    try {
         //ส่วนของยอดขาย

         // จัดรูปวันที่ให้อยู่ในรูปแบบของฐานข้อมูล
        const formattedDateForDB = format(subDays(currentDate,0), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        // ดึงข้อมูลจาก MongoDB สำหรับวันนี้
        const saledaily = await day_schema.findOne({ date: formattedDateForDB });
        const saleLastDay = saledaily ? saledaily.salesAmount : 0 ;
        
        //่ ส่วนของสินค้าใกล้จะหมด
        const products = await product_structure.find({});
        const outStockProducts = products.filter((product) => {
            return product.volume != -1 && product.volume !== null && product.volume < 5;
        });

        // สร้างอาร์เรย์ของข้อความที่มี "name" และ "volume"
        const outStockProductsTextArray = outStockProducts.map((product,index) => {
            if (index == 0){
                return `\n${product.name} ${product.volume}`;
            }
            else {
                return `${product.name} ${product.volume}`;
            }
        });

        // แปลงอาร์เรย์ข้อความเป็นข้อความเดียวโดยใช้ join()
        const outStockProductsText = outStockProductsTextArray.join('\n')

        request({
            method: 'POST',
            uri: url_line_notification,
            header: {
                'Content-Type': 'multipart/form-data',
            },
            auth: {
                bearer: token,
            },
            form: {
                message: `${date.getDate() +"/"+date.getMonth() +"/"+date.getFullYear()}\n\nยอดขายวันนี้: ${saleLastDay} บาท 💸\n\nสินค้าใกล้จะหมด
                \nชื่อ             คงเหลือ
                ${outStockProductsText} 
                `
            },
        }, (err, httpResponse, body) => {
            if (err) {
                console.log(err)
            } else {
                console.log(body)
            }
        });
        console.log("ส่งแจ้งเตือนในไลน์แล้ว!")
    }
    catch (err){
        console.log(err);
    }
}

module.exports = lineNotify ;