import React,{useState, useEffect} from 'react'
import './form.scss'
import {Navigate} from "react-router-dom";
import {ethers} from 'ethers'; 

const CreateForm = () => {
    const [signer, setSigner] = useState();
    const [signerAddress, setSignerAddress] = useState("");

    useEffect(() => {
        const connectWallet = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            console.log("signer", await signer.getAddress());
            setSigner(signer);
            setSignerAddress(address);
        };
        connectWallet();
    }, [])

    const [user,setUser]=useState({
        name:"",
        address:"",
        photo:"",
        formData: new FormData(),
        error:"",
        open:false,
    })
    const{name,address,photo,formData,error,open}=user

    const handleChange=event=>{
        const{name}=event.target;
        const value=name==="photo"?event.target.files[0]:event.target.value
        formData.set(name,value)
        setUser({...user,[name]:value,error:""})
    }

    const submit=async()=>{
        formData.set("address",signerAddress);
        try{
            const res=await fetch(`http://localhost:9000/create`,{
                method:"post",
                body:formData
            })
            const data = await res.json()
            console.log(data)
            if(data.error){
                setUser({...user,error:data.error})
            }
            else{
                setUser({name:"",address:"",photo:"",open:true})

            }
        }
        catch(err){
            console.log(err)
        }
    }
   

    //form
    const fillForm=()=>{
        return   <form onSubmit={e=>e.preventDefault()}>
        <div className='form-group'>
                <label className='text-muted'>photo</label>
                <input 
                type="file"
                onChange={handleChange}
                name="photo"
                />
            </div>
        <div className='form-group'>
                <label className='text-muted'>description</label>
                <input 
                type="text"
                value={name}
                name="name"
                onChange={handleChange}
                />
            </div>
            {/* <div className='form-group'>
                <label className='text-muted'>email</label>
                <input 
                type="text"
                value={email}
                name="email"
                onChange={handleChange}
                />
            </div> */}
            <button className='btn btn-raised btn-primary mt-2' onClick={()=>submit()}>submit</button>
        </form>
    }
    if(open){
       return  <Navigate to="/" />
    }
  return (
    <div className='container'>
        <h2 className='mt-5 mb-5'>Create Form</h2>
        <h2 className='mt-5 mb-5'>Address: {signerAddress}</h2>
        <div className='alert alert-danger' 
        style={{display:error?"":"none"}}
        >
            {error}
        </div>
        <div className='alert alert-info' 
        style={{display:open?"":"none"}}
        >
            post successfully sumitted
        </div>
        {fillForm()}
      

    </div>
  )
}

export default CreateForm