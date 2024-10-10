module.exports = {
    isLoggedIn: function(req,res,next){
        if(req.session.user){
            next();
        }else{
     
            req.session.save(function(err){
                res.redirect('/login');
            })
        }
    }
}