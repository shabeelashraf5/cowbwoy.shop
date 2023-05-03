var express = require('express');
const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const Table = require('cli-table');
const json2xls = require('json2xls');
const pdfmake = require('pdfmake');
const xlsx = require('xlsx');
const pdf = require('html-pdf')
const ejs = require('ejs')
const he = require('he');


const collection = require('../model/userD');
const collectionadmin = require('../model/adminD')
const collectionproduct = require('../model/productsD')
const collectioncategory = require('../model/categoryD')
const collectioncoupon = require('../model/couponD')
const collectionorder = require('../model/orderD')
const collectionbanner = require('../model/bannerD')
const multer = require('multer')
const path = require('path');
const fs = require('fs');


const adminLogin = function(req,res){
    res.render('adminlogin')
}

const adminHome = function(req, res){
    res.render('admin-home')
}

const loadLoginadmin = async function(req,res){
    try{

        const check = await collectionadmin.findOne({email: req.body.email})
        if(check.password === req.body.password){
            req.session.email = req.body.email
           console.log(req.session)
            console.log(req.body)
            res.render('admin-home')
        }else{
            
            
            res.render("adminlogin", { errpass: "Incorrect Password" })
        }
    }catch{
        
        res.render("adminlogin", { errmessage: "Enter your Email and Password" })
    }     
}

const adminCustomer = function(req,res){
    collection.find({}, function(err,docs){
        res.render('admin-customer', {cusDetails: docs})
    })
}

const createCustomer= function(req,res){
    res.render('create-cus')
}

const customerDetails = async function(req,res){
    const data =  {
        fname: req.body.fname ,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password
    }
    try{
     await collection.insertMany([data])
     res.redirect('/admin/customer')
    } catch {
       res.render('create-cus')

    }
}


const editCustomer = function(req,res){

    collection.findOneAndUpdate({ _id: req.params.id}, req.body,
        {new:true}, (err,docs) =>{

            if(err){
                console.log('Error Occured')
            }else{

                res.render('update-cus', {cusDetails: docs})
            }

        })

}


const updateCustomer =  function(req,res){

     collection.findByIdAndUpdate({_id: req.params.id}, req.body, (err,docs)=>{
        if(err){
            console.log('Error Occured')
        }else{
            res.redirect('/admin/customer')
        }
    })        

}


const deleteCustomer = function(req,res){

    collection.findByIdAndRemove( req.params.id, (err,docs) =>{

        if(err){
            console.log('Error Occured')
        }else{
            res.redirect('/admin/customer')
        }

    })
}


/* function checkManager(req, res, next) {
    if (req.session && req.session.isManager === true) {
      next(); 
    } else {
      res.status(401).send('Unauthorized'); 
    }
  } */


 /* const adminUser = function(req,res){
    collectionadmin.find({}, function(err,docs){
        res.render('admin-adminuser', {admDetails: docs})
    })

} */

const adminUser = function(req, res) {
    console.log('Checking if user is a manager...');
    collectionadmin.findOne({ email: req.session.email, isManager: true }, function(err, manager) {
        if (err || !manager) {
            console.log('User is not a manager');
           // res.redirect('/adminlogin');
              res.render('unauth', {message: 'You are Unauthorized to enter this panel'})
        } else {
            console.log('User is a manager. Retrieving admin users from the database...');
            collectionadmin.find({}, function(err, docs) {
                res.render('admin-adminuser', { admDetails: docs });
            });
        }
    });
}


const createadmin= function(req,res){
   
    res.render('create-adm')
}

const adminDetails = async function(req,res){
    const data =  {
        name: req.body.name ,
      
        email: req.body.email,
        password: req.body.password
    }
    try{
     await collectionadmin.insertMany([data])
     res.redirect('/admin/adminUser')
    } catch {
       res.render('create-adm')

    }
}


const editadmin = function(req,res){

    collectionadmin.findOneAndUpdate({ _id: req.params.id}, req.body,
        {new:true}, (err,docs) =>{

            if(err){
                console.log('Error Occured')
            }else{

                res.render('update-adm', {admDetails: docs})
            }

        })

}


const updateadmin =  function(req,res){

    collectionadmin.findByIdAndUpdate({_id: req.params.id}, req.body, (err,docs)=>{
       if(err){
           console.log('Error Occured')
       }else{
           res.redirect('/admin/adminUser')
       }
   })        

}


const deleteadmin = function(req,res){

    collectionadmin.findByIdAndRemove( req.params.id, (err,docs) =>{

        if(err){
            console.log('Error Occured')
        }else{
            res.redirect('/admin/adminUser')
        }

    })
}


const adminProduct = function(req,res){
    collectionproduct.find({}).populate('category_id').exec(function(err,docs){
        res.render('admin-product', {proDetails: docs})
    })
}




const createproduct= async function(req,res){
    const categories = await collectioncategory.find();
     
    console.log(categories);
    res.render('create-product', { categories })
}


const productDetails = async function(req, res, next){

    const title = req.body.title;
    const image = req.files.map(file => file.filename);
    const price = req.body.price;
    const description = req.body.description;
    const category_id = req.body.category_id;

  
    if (!title || !image || !price || !description || !category_id) {
        const error2 = "Please fill in all required fields.";
        res.render('create-product', { error2 });
        return;
    }

    const product = {
        title,
        image,
        price,
        description,
        category_id
    };

    try {
        await collectionproduct.create(product);
        console.log(req.files);
        res.redirect('/admin/product');
    } catch (err) {
        const errorMessage = "Only JPG and PNG files are supported";
        console.log(err.message);
        res.render('create-product', { errorMessage });
    }
};



/* const editproduct = function(req,res){
    const image = req.files ? req.files.map(file => file.filename) : undefined;
    collectionproduct.findOneAndUpdate({ _id: req.params.id}, {...req.body, image: image},
        {new:true}, (err,docs) =>{

            if(err){
                console.log('Error Occured')
            }else{
                
                res.render('update-product', {proDetails: docs})
            }

        })

} */

const editproduct = function(req, res) {
    const image = req.files ? req.files.map(file => file.filename) : undefined;
    const update = { ...req.body };
    if (!image || image.length === 0) {
       
        collectionproduct.findById(req.params.id, (err, doc) => {
            if (err) {
                console.log('Error Occured');
            } else {
                update.image = doc.image;
                collectionproduct.findOneAndUpdate({ _id: req.params.id }, update, { new: true }, (err, docs) => {
                    if (err) {
                        console.log('Error Occured');
                    } else {
                        res.render('update-product', { proDetails: docs });
                    }
                });
            }
        });
    } else {
        
        collectionproduct.findOneAndUpdate({ _id: req.params.id }, { ...update, image }, { new: true }, (err, docs) => {
            if (err) {
                console.log('Error Occured');
            } else {
                res.render('update-product', { proDetails: docs });
            }
        });
    }
};

const deleteimage = function(req, res) {
    const productId = req.params.id;
    const imageId = req.params.imageId;
    collectionproduct.findById(productId, (err, doc) => {
        if (err) {
          console.log('Error Occured');
        } else if (!doc) {  
          console.log('Product not found');
        } else {
          
          const updatedImages = doc.image.filter(image => image !== imageId);
          collectionproduct.findOneAndUpdate({ _id: productId }, { image: updatedImages }, { new: true }, (err, docs) => {
            if (err) {
              console.log('Error Occured');
            } else {
             
              const imagePath = path.join(__dirname, '../public/images', imageId);
              fs.unlink(imagePath, (err) => {
                if (err) {
                  console.log('Error Occured');
                } else {
                  res.redirect(`/admin/product/update/${productId}`);
                }
              });
            }
          });
        }
      });
};



/* const updateproduct =  function(req,res){

  
    const image = req.files ? req.files.map(file => file.filename) : undefined;
    collectionproduct.findByIdAndUpdate({_id: req.params.id},  {...req.body, image: image} , (err,docs)=>{
       if(err){
           console.log('Error Occured')
       }else{

           console.log('Product Updated')
           res.redirect('/admin/dashboard/product')
       }
   })        

} */

const updateproduct = function(req, res) {
    const newImages = req.files ? req.files.map(file => file.filename) : undefined;
  
    collectionproduct.findById(req.params.id, function(err, product) {
      if (err) {
        console.log('Error Occured');
        res.redirect('/admin/product');
      } else {
        const existingImages = product.image;
        const updatedProduct = {...req.body};
        
        if (newImages) {
          updatedProduct.image = [...existingImages, ...newImages];
        } else {
          updatedProduct.image = existingImages;
        }
        
        collectionproduct.findByIdAndUpdate({_id: req.params.id}, updatedProduct, function(err, docs) {
          if (err) {
            console.log('Error Occured');
          } else {
            console.log('Product Updated');
          }
          res.redirect('/admin/product');
        });
      }
    });
  }


const deleteproduct = function(req,res){

    collectionproduct.findByIdAndRemove( req.params.id, (err,docs) =>{

        if(err){
            console.log('Error Occured')
        }else{
            res.redirect('/admin/product')
        }

    })
}



    const activeProduct =  function(req,res){

        const productId = req.params.id;
        const isActive = req.body.active;

        collectionproduct.findByIdAndUpdate(productId,
          { active: isActive },
          { new: true }, (err,docs)=>{
           if(err){
               console.log('Error Occured')
           }else{
    
               console.log('Product Updated')
               res.redirect('/admin/product')
           }
       })        
    
    }


    const blockUser =  function(req,res){

        const productId = req.params.id;
        const isActive = req.body.blocked;

        collection.findByIdAndUpdate(productId,
          { blocked: isActive },
          { new: true }, (err,docs)=>{
           if(err){
               console.log('Error Occured')
           }else{
    
               console.log('User Updated')
               res.redirect('/admin/customer')
           }
       })        
    
    }

    const adminCategory = function(req,res){
        collectioncategory.find({}, function(err,docs){
            res.render('admin-category', {catDetails: docs})
        })
    }


    const createcategory= function(req,res){
          
        

        res.render('create-category')
    }



    const categoryDetails = async function(req,res){
        const product =  {
            title: req.body.title 
        }
        try{
            if (!product.title) {
                res.render('create-category', {
                    error1: 'Category title is required'
                })
            }
            await collectioncategory.insertMany([product])
            res.redirect('/admin/category')
        } catch (err) {
            if (err.code === 11000) {
                res.render('create-category', {
                    error: 'Category already exists'
                });
            } else {
                res.render('create-category', {
                    error: err.message
                });
            }
        }
    }
    


    const editCategory = function(req,res){

        collectioncategory.findOneAndUpdate({ _id: req.params.id}, req.body,
            {new:true}, (err,docs) =>{
    
                if(err){
                    console.log('Error Occured')
                }else{
    
                    res.render('update-category', {catDetails: docs})
                }
    
            })
    
    }
    
    
    const updateCategory =  function(req,res){
    
         collectioncategory.findByIdAndUpdate({_id: req.params.id}, req.body, (err,docs)=>{
            if(err){
                console.log('Error Occured')
            }else{
                res.redirect('/admin/category')
            }
        })        
    
    }



    const deletecategory = function(req,res){

        collectioncategory.findByIdAndRemove( req.params.id, (err,docs) =>{
    
            if(err){
                console.log('Error Occured')
            }else{
                res.redirect('/admin/category')
            }
    
        })
    }


    const activeCategory =  function(req,res){

        const categoryId = req.params.id;
        const isActive = req.body.active;

        collectioncategory.findByIdAndUpdate(categoryId,
          { active: isActive },
          { new: true }, (err,docs)=>{
           if(err){
               console.log('Error Occured')
           }else{
    
               console.log('Category Updated')
               res.redirect('/admin/category')
           }
       })        
    
    }

    const logoutadmin = function (req,res){

        req.session.destroy()
    
        res.redirect('/admin')
    }

    const adminCoupon = function(req,res){
        collectioncoupon.find({}, function(err,docs){
            res.render('admin-coupon', {couDetails: docs})
        })
    }

    const createcoupon= function(req,res){
        res.render('create-coupon')
    }



    const couponDetails = async function(req,res){
        const coupon =  {
            code: req.body.code,
            price: req.body.price
        }
        try{
         await collectioncoupon.insertMany([coupon])
         res.redirect('/admin/coupon')
        } catch (err) {

            if (err.code === 11000) {
                res.render('create-coupon', {
                    error: 'Coupon already exists'
                });
            } else {
                res.render('create-coupon');
            }
    
        }
    }


    const editCoupon = function(req,res){

        collectioncoupon.findOneAndUpdate({ _id: req.params.id}, req.body,
            {new:true}, (err,docs) =>{
    
                if(err){
                    console.log('Error Occured')
                }else{
    
                    res.render('update-coupon', {couDetails: docs})
                }
    
            })
    
    }
    
    
    const updateCoupon =  function(req,res){
    
         collectioncoupon.findByIdAndUpdate({_id: req.params.id}, req.body, (err,docs)=>{
            if(err){
                console.log('Error Occured')
            }else{
                res.redirect('/admin/coupon')
            }
        })        
    
    }



    const deletecoupon = function(req,res){

        collectioncoupon.findByIdAndRemove( req.params.id, (err,docs) =>{
    
            if(err){
                console.log('Error Occured')
            }else{
                res.redirect('/admin/coupon')
            }
    
        })
    }

    const adminOrder =async function(req,res){
            const orderDetails = await collectionorder.find().populate('address_id');
            res.render('admin-order', {orderDetails: orderDetails})
       
    }

    const adminOrder2 = async function(req, res) {
        const orderId = req.params.id;
        const orderDetails = await collectionorder.findById(orderId).populate('cart_id.order_items.product_id');
      
        res.render('admin-orderaction', {
            orderItems: orderDetails.order_items.map(item => ({
            image: item.image[0],
            productName: item.title,
            unitPrice: item.price,
            quantity: item.quantity,
            category: item.category
          }))
        });
      };
      


    const adminBanner = function(req,res){
        collectionbanner.find({}, function(err,docs){
            res.render('admin-banner', {bannerDetails: docs})
        })
    }
    

    const createBanner= function(req,res){
        res.render('create-banner')
    }




    const bannerDetails = async function(req, res, next){
    const image = req.files.map(file => file.filename);
    const banner = {
        image,   
    };

    try {
        await collectionbanner.create(banner);
        console.log(req.files);
        res.redirect('/admin/banner');
    } catch (err) {
        const errorMessage = "Only JPG and PNG files are supported";
        console.log(err.message);
        res.render('create-banner', { errorMessage });
    }
   
    };




    const editbanner = function(req, res) {
        const image = req.files ? req.files.map(file => file.filename) : undefined;
        const update = { ...req.body };
        if (!image || image.length === 0) {
           
            collectionbanner.findById(req.params.id, (err, doc) => {
                if (err) {
                    console.log('Error Occured');
                } else {
                    update.image = doc.image;
                    collectionbanner.findOneAndUpdate({ _id: req.params.id }, update, { new: true }, (err, docs) => {
                        if (err) {
                            console.log('Error Occured');
                        } else {
                            res.render('update-banner', { proDetails: docs });
                        }
                    });
                }
            });
        } else {
            
            collectionbanner.findOneAndUpdate({ _id: req.params.id }, { ...update, image }, { new: true }, (err, docs) => {
                if (err) {
                    console.log('Error Occured');
                } else {
                    res.render('update-banner', { proDetails: docs });
                }
            });
        }
    };

    const updatebanner = function(req, res) {
        const newImages = req.files ? req.files.map(file => file.filename) : undefined;
      
        collectionbanner.findById(req.params.id, function(err, product) {
          if (err) {
            console.log('Error Occured');
            res.redirect('/admin/banner');
          } else {
            const existingImages = product.image;
            const updatedProduct = {...req.body};
            
            if (newImages) {
              updatedProduct.image = [...existingImages, ...newImages];
            } else {
              updatedProduct.image = existingImages;
            }
            
            collectionbanner.findByIdAndUpdate({_id: req.params.id}, updatedProduct, function(err, docs) {
              if (err) {
                console.log('Error Occured');
              } else {
                console.log('Product Updated');
              }
              res.redirect('/admin/banner');
            });
          }
        });
      }

    
    const deleteimagebanner = function(req, res) {
        const bannerId = req.params.id;
        const imageId = req.params.imageId;
        collectionbanner.findById(bannerId, (err, doc) => {
            if (err) {
              console.log('Error Occured');
            } else if (!doc) {  
              console.log('Product not found');
            } else {
              
              const updatedImages = doc.image.filter(image => image !== imageId);
              collectionbanner.findOneAndUpdate({ _id: bannerId }, { image: updatedImages }, { new: true }, (err, docs) => {
                if (err) {
                  console.log('Error Occured');
                } else {
                 
                  const imagePath = path.join(__dirname, '../public/images', imageId);
                  fs.unlink(imagePath, (err) => {
                    if (err) {
                      console.log('Error Occured');
                    } else {
                      res.redirect(`/admin/banner/update/${bannerId}`);
                    }
                  });
                }
              });
            }
          });
    };

    const deletebanner = function(req,res){

        collectionbanner.findByIdAndRemove( req.params.id, (err,docs) =>{
    
            if(err){
                console.log('Error Occured')
            }else{
                res.redirect('/admin/banner')
            }
    
        })
    }


       /* const adminDashboard = async function(req, res) {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
        const totalOrders = await collectionorder.aggregate([
          { $match: {} },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
      
        const todayOrders = await collectionorder.aggregate([
          { $match: { createdAt: { $gte: startOfToday, $lt: endOfToday } } },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
      
        res.render('admindashboard', { totalOrders: totalOrders[0].total, todayOrders: todayOrders[0].total });
      }; */



      /* const adminDashboard = async function(req, res) {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
        const totalOrders = await collectionorder.aggregate([
          { $match: {} },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
      
        const todayOrders = await collectionorder.aggregate([
          { $match: { createdAt: { $gte: startOfToday, $lt: endOfToday } } },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
      
        const totalOrdersValue = totalOrders.length > 0 ? totalOrders[0].total : '';
        const todayOrdersValue = todayOrders.length > 0 ? todayOrders[0].total : '';

        
      
        res.render('admindashboard', { totalOrders: totalOrdersValue, todayOrders: todayOrdersValue });
      }; */



        const adminDashboard = async function(req, res) {
            try {

                const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const totalOrders = await collectionorder.aggregate([
            { $match: {} },
            { $group: { _id: null, total: { $sum: "$total" } } }
          ]);
        
          const todayOrders = await collectionorder.aggregate([
            { $match: { createdAt: { $gte: startOfToday, $lt: endOfToday } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
          ]);
        
          const totalOrdersValue = totalOrders.length > 0 ? totalOrders[0].total : '';
          const todayOrdersValue = todayOrders.length > 0 ? todayOrders[0].total : '';
  
          


            const orders = await collectionorder.find({});
            const orderCountByCategory = {};

             // calculate the total count of orders for each month
    const orderCountByMonth = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      if (orderCountByMonth[month]) {
        orderCountByMonth[month]++;
      } else {
        orderCountByMonth[month] = 1;
      }
    });

    // populate the labels and data arrays for the line chart
    const monthlySale = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const orderNumber = monthlySale.map((label, index) => {
      return orderCountByMonth[index] || 0;
    });

    console.log(monthlySale);
    console.log(orderNumber)

    // escape special characters in the JavaScript variables
    const escapedMonthly = JSON.stringify(monthlySale).replace(/%/g, '%25');
    const escapedorderN = JSON.stringify(orderNumber).replace(/%/g, '%25');

        
            // calculate the total count of orders for each category
            orders.forEach(order => {
                order.order_items.forEach(item => {
                const category = item.category;
                if (orderCountByCategory[category]) {
                    orderCountByCategory[category]++;
                } else {
                    orderCountByCategory[category] = 1;
                }
                });
            });
        
            // populate the labels and data arrays for the pie chart
            const labels = Object.keys(orderCountByCategory);
            const data = Object.values(orderCountByCategory);
        
            console.log(labels);
            console.log(data);
        
            // escape special characters in the JavaScript variables
            const escapedLabels = JSON.stringify(labels).replace(/%/g, '%25');
            const escapedData = JSON.stringify(data).replace(/%/g, '%25');
        
            // render the admin dashboard template with the pie chart
            res.render('admindashboard', { escapedLabels, escapedData, escapedMonthly, escapedorderN,  totalOrders: totalOrdersValue, todayOrders: todayOrdersValue });
            } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
            }
        };



     /* const adminReport = function(req,res){
        collectionorder.find({}, function(err, orders){
          if(err) throw err;
      
          // create PDF file
          const pdfDoc = new PDFDocument();
          pdfDoc.pipe(fs.createWriteStream('sales_report.pdf'));
      
          pdfDoc.fontSize(18).text('Sales Report', { align: 'center' });
          pdfDoc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
          pdfDoc.moveDown();
      
          // Add table
          const table = new Table({
            head: ['Order ID', 'Customer Name', 'Total Amount', 'Status'],
            colWidths: [100, 200, 100, 100]
          });
      
          orders.forEach(function(order) {
            table.push([order._id, order.customers_id.name, order.total, order.status]);
          });
      
          pdfDoc.table(table, {
            prepareHeader: () => pdfDoc.font('Helvetica-Bold'),
            prepareRow: () => pdfDoc.font('Helvetica')
          });
      
          pdfDoc.end();
      
          // create Excel file
          const xls = json2xls(orders);
          fs.writeFileSync('sales_report.xlsx', xls, 'binary');
      
          // render the view
          res.render('admin-report');
        });
      }; */

  
      /* const adminReport = async function(req, res) {
        try {
          // Retrieve orders from the database with the necessary fields
          const orders = await collectionorder.find().select('customers_id address_id status total payment_method order_items');
          
          // Format the data for the Excel sheet
          const data = orders.map(order => ({
            'Order ID': order._id,
            'Customer ID': order.customers_id,
            'Address ID': order.address_id,
            'Status': order.status,
            'Payment Method': order.payment_method,
            'Product Title': order.order_items.map(item => `${item.title} (${item.category})`).join(', '),
            'Product Price': order.order_items.map(item => item.price).join(', '),
            'Product Quantity': order.order_items.map(item => item.quantity).join(', '),
            'Total Price': order.total
          }));
      
          // Define the column configuration for the Excel sheet
          const columns = [
            { header: 'Order ID', key: 'Order Number' },
            { header: 'Customer ID', key: 'Customer ID' },
            { header: 'Address ID', key: 'Address ID' },
            { header: 'Status', key: 'Status' },
            { header: 'Payment Method', key: 'Payment Method' },
            { header: 'Product Title', key: 'Product Title' },
            { header: 'Product Category', key: 'Product Category' }, // <-- add this line
            { header: 'Product Price', key: 'Product Price' },
            { header: 'Product Quantity', key: 'Product Quantity' },
            { header: 'Total Price', key: 'Total Price' }
          ];
      
          // Create the Excel workbook and worksheet
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.sheet_add_json({}, data, { header: columns });
      
          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
      
          // Generate a buffer from the workbook
          const buffer = XLSX.write(wb, { type: 'buffer' });
      
          // Set the response headers
          res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=sales_report.xlsx'
          });
      
          // Send the file as a response
          res.send(buffer);
        } catch (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
      }; */

      const adminReport = async function(req, res) {
        // Fetch order data from the database
        const orders = await collectionorder.find().populate('customers_id address_id cart_id.product_id').exec();
      
        // Generate Excel file
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');
        worksheet.columns = [
          { header: 'Order ID', key: 'orderId', width: 10 },
          { header: 'Customer Name', key: 'customerName', width: 20 },
          { header: 'Product Name', key: 'productName', width: 20 },
          { header: 'Quantity', key: 'quantity', width: 10 },
          { header: 'Price', key: 'price', width: 10 },
          { header: 'Total', key: 'total', width: 10 }
        ];
        orders.forEach(order => {
          order.order_items.forEach(item => {
            worksheet.addRow({
              orderId: order._id,
              customerName: order.customers_id.fname + ' ' + order.customers_id.lname,
              productName: item.title,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price
            });
          });
        });
        const buffer = await workbook.xlsx.writeBuffer();
      
        // Fetch customer data from the database
        const customers = await collection.find().exec();
      
        // Generate PDF file
        const doc = new PDFDocument();
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.fontSize(12).text('Generated on ' + new Date().toLocaleDateString(), { align: 'center' });
        doc.moveDown();
        doc.text('Order ID   Customer Name   Product Name   Quantity   Price   Total');
        doc.moveDown();
        orders.forEach(order => {
          order.order_items.forEach(item => {
            
            doc.text(`${order._id} ${order.customers_id.fname + ' ' + order.customers_id.lname} ${item.title}   ${item.quantity}   ${item.price}   ${item.quantity * item.price}`);
          });
        });
        const pdfBuffer = await new Promise(resolve => {
          const buffers = [];
          doc.on('data', buffer => buffers.push(buffer));
          doc.on('end', () => resolve(Buffer.concat(buffers)));
          doc.end();
        });
      
        res.render('admin-report', { excelBuffer: buffer, pdfBuffer: pdfBuffer });
      };
      



      const downloadexcel = function(req,res){

        const buffer = Buffer.from(req.body.excelBuffer, 'base64');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
        res.send(buffer);


      }

      const downloadPdf = function(req,res){

        const buffer = Buffer.from(req.body.pdfBuffer, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
        res.send(buffer);


      }
      
      
      
    
module.exports = {

    adminLogin,
    loadLoginadmin,
    adminDashboard,
    adminCustomer,
    createCustomer,
    customerDetails,
    editCustomer,
    updateCustomer,
    deleteCustomer,
    adminUser,
    createadmin,
    adminDetails,
    editadmin,
    updateadmin,
    deleteadmin,
    adminProduct,
    createproduct,
    productDetails,
    editproduct,
    updateproduct,
    deleteproduct,
    activeProduct,
    blockUser,
    adminCategory,
    createcategory,
    categoryDetails,
    deletecategory,
    deleteimage,
    updateCategory,
    logoutadmin,
    editCategory,
    adminCoupon,
    createcoupon,
    couponDetails,
    editCoupon,
    updateCoupon,
    deletecoupon,
    adminOrder,
    adminOrder2,
    adminBanner,
    createBanner,
    bannerDetails,
    activeCategory,
    editbanner,
    deleteimagebanner,
    updatebanner,
    deletebanner,
    adminReport,
    downloadexcel,
    downloadPdf,
    adminHome

}