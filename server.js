const express=require("express");
const path=require("path");
const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

let users=[];
let tasks=[
{id:1,title:"Image Verification",description:"Does this image contain a car?",reward:1,type:"yesno"},
{id:2,title:"Product Verification",description:"Is this product a shoe?",reward:1,type:"yesno"},
{id:3,title:"Text Verification",description:"Does this image contain readable text?",reward:1,type:"yesno"}
];
let submissions=[];

app.post("/api/register",(req,res)=>{
const{name,email}=req.body;
if(!name||!email)return res.status(400).json({success:false,message:"Name and email are required"});
const cleanEmail=email.trim().toLowerCase();
if(!cleanEmail.includes("@"))return res.status(400).json({success:false,message:"Enter a valid email"});
if(users.find(u=>u.email===cleanEmail))return res.status(400).json({success:false,message:"Account already exists. Please login."});
const user={id:users.length+1,name:name.trim(),email:cleanEmail,balance:0,tasksCompleted:0};
users.push(user);
res.json({success:true,user});
});

app.post("/api/login",(req,res)=>{
const{email}=req.body;
if(!email)return res.status(400).json({success:false,message:"Email is required"});
const cleanEmail=email.trim().toLowerCase();
const user=users.find(u=>u.email===cleanEmail);
if(!user)return res.status(404).json({success:false,message:"Account not found. Please register first."});
res.json({success:true,user});
});

app.get("/api/tasks",(req,res)=>{
res.json({success:true,tasks});
});

app.post("/api/tasks/submit",(req,res)=>{
const{userId,taskId,answer}=req.body;
const user=users.find(u=>u.id===Number(userId));
const task=tasks.find(t=>t.id===Number(taskId));

if(!user)return res.status(404).json({success:false,message:"User not found"});
if(!task)return res.status(404).json({success:false,message:"Task not found"});
if(!answer)return res.status(400).json({success:false,message:"Answer is required"});

const already=submissions.find(s=>s.userId===user.id&&s.taskId===task.id);

if(already)return res.status(400).json({success:false,message:"You already completed this task"});

const submission={
id:submissions.length+1,
userId:user.id,
taskId:task.id,
answer,
reward:task.reward,
createdAt:new Date().toISOString()
};

submissions.push(submission);
user.balance+=task.reward;
user.tasksCompleted+=1;

res.json({
success:true,
message:"Task completed successfully",
reward:task.reward,
balance:user.balance,
tasksCompleted:user.tasksCompleted
});
});

app.get("/api/user/:id",(req,res)=>{
const user=users.find(u=>u.id===Number(req.params.id));

if(!user)return res.status(404).json({success:false,message:"User not found"});

res.json({success:true,user});
});

app.get("/api/user/:id/submissions",(req,res)=>{
const userId=Number(req.params.id);
const user=users.find(u=>u.id===userId);

if(!user)return res.status(404).json({success:false,message:"User not found"});

const history=submissions
.filter(s=>s.userId===userId)
.map(s=>{
const task=tasks.find(t=>t.id===s.taskId);
return{
id:s.id,
taskTitle:task?task.title:"Task",
answer:s.answer,
reward:s.reward,
createdAt:s.createdAt
};
});

res.json({success:true,history});
});

app.get("/api/stats",(req,res)=>{
res.json({
success:true,
users:users.length,
tasks:tasks.length,
submissions:submissions.length,
totalRewardsPaid:submissions.reduce((sum,s)=>sum+s.reward,0)
});
});

app.get("*",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"));
});

app.listen(PORT,()=>{
console.log(`Mobile Work Platform running on port ${PORT}`);
});
