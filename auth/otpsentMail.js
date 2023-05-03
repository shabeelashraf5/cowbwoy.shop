const nodemailer = require('nodemailer');
const { token } = require('morgan');
const otpGenerator = require('otp-generator');

const otpsentMail = async function (fname, email, otp){


    try {

        
         
        const transporter = nodemailer.createTransport({
            
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth:{
                user: 'mastercoding34@gmail.com',
                pass: 'cbgscfkeoiklzqqa'
            }
        })

        const mailOption ={
            from: 'mastercoding34@gmail.com',
            to:email,
            subject:'OTP for Sign Up',
            html:'<h2> Hello '+fname+', Your OTP for registration is '+otp+' <h2>'
        }

        transporter.sendMail(mailOption, function(error,info){

            if(error){
                console.log(error)
            }else{
                console.log("Email has been sent", info.response)
            }
        })
        
    }catch{

        console.log('Error Occured')
    }
    
} 


module.exports ={

    otpsentMail

}