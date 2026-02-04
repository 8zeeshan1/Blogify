const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8000;
const path = require("path")
const Blog = require("./models/blog");
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/addblog");
app.set("view engine", "ejs"); 
app.set("views", path.resolve("./views"));

const { connectMongoDB } = require("./connection");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/auth");
const User = require("./models/user");
const { getObjectURL, putObjectURL } = require("./service/s3");
connectMongoDB(process.env.MONGO_URI)
    .then(console.log("MongoDB Connected"));
app.use(express.static(path.join(__dirname,"public"))); //we use this because the server treats the source of the photo as the path so we have to make the public directory static so image could be rendered properly.
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.json());
//devDependencies when we are working with development that dependencies that we want to use just in the development process and not in the deployment that dependencies are dev depencies. When we work with production dev dependencies are not installed there.
app.use("/user", userRoutes);

app.get('/favicon.ico', (req, res) => res.status(204))

app.use(checkForAuthenticationCookie("token"));

app.get("/", async(req, res)=>{
    const blogs = await Blog.find({});
    return res.render("home", {
        blogs: blogs,
        user: req.userName
    });
})

app.use("/blog", blogRoutes);


app.get("/:id", async(req, res)=>{
    const blogs = await Blog.find({createdBy: req.params.id });
    if(blogs.length>0){
        blogs.forEach(async blog=>{
            blog.coverImageURL = await getObjectURL(blog.coverImageURL);
        });
    }
    const userProfile = await User.findById(req.params.id);
    return res.render("profile", {
        userDetails: { userProfile: await getObjectURL(userProfile.profileImage),
                       userName: userProfile.fullName,
                       userId: userProfile._id,
        },
        blogs: blogs,
        user: req.user,
        userName: req.userName?.fullName,
        userProfile: req.userName?.profileImage,
    });
})


app.post("/:id/changeProfile", async (req, res)=>{
    if(!(req.user._id === req.params.id)){
        return res.send("You are not authorize to do so");
    }
    await User.findByIdAndUpdate((req.params.id), {
        profileImage: `images/${req.body.fileName}`
    });
    const url = await putObjectURL(`images/${req.body.fileName}`, req.body.fileType);
    return res.json({
        url: url
});
});
// app.post("/:id", async(req, res)=>{
//     if(!(req.user._id === req.params.id)){
//         return res.send("You are not authorize to do so");
//     }
//      await User.findByIdAndUpdate(req.params.id, {
//          profileImage: `images/${req.file.filename}`,
//      });
//     return res.redirect(`/${req.user._id}`);
// });

app.listen(PORT, ()=>{
    console.log(`Server started at PORT: ${PORT}`);
});