const nodemailer = require('nodemailer');
const { token } = require('morgan');

const sentMail = async function (fname,email, token){

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
            subject:'For Reset Password',
            html:'<h2> Hello '+fname+', please click to <a href="http://127.0.0.1:3000/reset-password/?token='+token+'">Reset</a> your password<h2>'
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

    sentMail

}