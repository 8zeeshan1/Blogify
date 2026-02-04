const { Router } = require("express");
const router = Router();
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { putObjectURL, getObjectURL } = require("../service/s3");
const Busboy = require('busboy');
const cloudinary = require("../service/cloudinary")

router.get("/add-new", async(req, res)=>{
    if(!req.user){
        return res.redirect("/user/signin");
    }
    return res.render("addblog",{
        user: req.user,
        userName: req.userName?.fullName,
        userProfile: req.userName?.profileImage,
    });
});

router.put('/add-new/upload', (req, res) => {  // The name here we give must be same as the name field of the frontend file.

    const busboy = Busboy({headers: req.headers});
    busboy.on('file', (fieldName, file, fileName, encoding, mimetype)=>{
        const cloudinaryStream = cloudinary.uploader.upload_stream(
            {
                folder: 'uploads',
                resource_type: "auto",
            },
            (error, result) => {
                if(error){
                    console.error("It's an error: ", error);
                    console.log("It's a result: ", result);
                    return res.json("An error occured.")
                }
                return res.json({
                    message: "Uploaded successfully",
                    secret_url: result.secure_url
                })
            }
        );
        file.pipe(cloudinaryStream)
    })

    req.pipe(busboy)
});

// router.post("/metadata", async (req, res)=>{
//   const url = await putObjectURL(`uploads/${req.body.fileName}`, req.body.fileType);
//   const key = `uploads/${req.body.fileName}`;
//     return res.json({
//         url: url,
//         key: `uploads/${req.body.fileName}`,
//     })
// });

router.post("/", async (req, res)=>{
      console.log(req.body);
    const blog = await Blog.create({
        title: req.body.title,
        body: req.body.body, 
        coverImageURL: req.body.secret_url,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${blog._id}`);
});

router.get("/:id", async (req, res)=>{
    const blog = await Blog.findById(req.params.id).populate("createdBy"); // This we do because we want the details of the user who created this blog and display it there so for that we populate blog schema with user schema populate will take the id and search in the user schema for that user because we have gave the ref as the user.
    //blog.coverImageURL = await getObjectURL(blog.coverImageURL);
    const comments = await Comment
                                .find({ commentedOnBlog: req.params.id })
                                .populate("commentedBy");
    //blog.createdBy.profileImage = await getObjectURL(blog.createdBy.profileImage);

    // if(comments.length>0){
    // for(comment of comments){
    //     comment.commentedBy.profileImage = await getObjectURL(comment.commentedBy.profileImage);
    // };
//}
    res.render("blog", {
        blog: blog,
        user: req.user,
        userName: req.userName?.fullName,
        userProfile: req.userName?.profileImage,
        comments: comments,
    });
});

router.post("/comment/:id", async (req, res)=>{
    const comment = req.body.comment;
    await Comment.create({
        content: comment,
        commentedBy: req.user._id,
        commentedOnBlog: req.params.id,
    });
    return res.redirect(`/blog/${req.params.id}`);
});


module.exports = router;