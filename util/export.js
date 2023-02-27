const order=require('../models/orderModel')
const excelJS = require('exceljs');
//exportorder
const exportorder = async (req,res)=>{
    console.log("111111111111111");
   
    try{
        console.log("222222222222");

  const workbook = new excelJS.Workbook();
  const  worksheet = workbook.addWorksheet("Sales Roport")
  worksheet.columns=[
    // {header:"s no.", key:"s_no"},
    // {header:"Date", key:"data"},
    {header:"User", key:"user"},
    {header:"Payment", key:"payment"},
    // {header:"Status", key:"status"},
    // {header:"Items", key:"item"},
    {header:"total", key:"total"},
  ];
  let counter =1;
  let totalof = 0;
  console.log("3333333333333");

  const saledata = await order.find();
  saledata.forEach((sale)=>{
    // const date = sale.paymentMethod;
    // const isoString = date.toISOString();
    // const newDate = isoString.split('T')[0];
    // sale.data=newDate
//   sale.s_no = counter
console.log('====================================');
console.log(sale);
console.log('====================================');
console.log("44444444444444");

  sale.user=sale.name
  console.log("55555555555555");

  sale.payment=sale.paymentMethod
  console.log("666666666666666666666666");

//   sale.item=sale.product.length
  let myValue = sale.totalPrice;
let newValue = isNaN(myValue) ? 0 : myValue;
 let tot= 1*newValue
  totalof += tot
  worksheet.addRow(sale);
  counter++;
  });
  worksheet.addRow({ data: 'Total', total: totalof});
  worksheet.getRow(1).eachCell((cell)=>{
    cell.font={bold:true};
  });
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheatml.sheet'
  );
  res.setHeader('Content-Disposition',`attachment; filename=sales_Report.xlsx`);
  return workbook.xlsx.write(res).then(()=>{
    res.status(200);
  });
    }
    catch(error){
  (error.message)
    }
  
  }
  module.exports = {
    exportorder,
  }  
