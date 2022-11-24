import React, { useEffect, useState } from "react";
import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardImage,
    MDBBtn,
    MDBCardFooter,
} from "mdb-react-ui-kit";
import { Link } from "react-router-dom";
import DefaultPhoto from "../../images/logo.png";
import { ethers } from "ethers";

const GetForm = () => {
    const [posts, setPosts] = useState([]);
    const [del, setDel] = useState({});
    const [signer, setSigner] = useState();
    const [signerAddress, setSignerAddress] = useState("");
    const [verify, setSmcVerify] = useState();
    const [token, setSmcToken] = useState();
    const [balanceToken, setBalanceToken] = useState("");
    var [reset, setReset] = useState(0);

    const verifyAddress = "0x1f77DBA4F149285Ee702Cd47B46aB86cbA59b3fb";
    const tokenAddress = "0x489f38DCB4Af09a67FB4232457fCee72649Bf8AC";
    const verifyABI = require('../contract/abi/verify.json');
    const tokenABI = require('../contract/abi/token.json');


    const deletePost = async (id) => {
        let response = await fetch(`http://localhost:9000/delete/${id}`, {
            method: "DELETE",
        });
        const data = await response.json();
        setDel(data);
    };
    const acceptPost = async (id, admin, sign) => {
        let response = await fetch(
            `http://localhost:9000/accept/${id}?admin=${admin}&sign=${sign}`,
            {
                method: "PUT",
            }
        );
        const data = await response.json();
        setDel(data);
    };
    const rejectPost = async (id) => {
        let response = await fetch(`http://localhost:9000/reject/${id}`, {
            method: "PUT",
        });
        const data = await response.json();
        setDel(data);
    };

    const deleteConfirmed = (userId) => {
        let ans = window.confirm("Are you sure you want to delete");
        if (ans) {
            deletePost(userId);
        }
    };
    const acceptConfirmed = async (userId, userAddress) => {
        let ans = window.confirm("Are you sure you want to accept");
        let mess = `${userAddress.toLowerCase()}${userId.toLowerCase()}`;
        const signature = await signer.signMessage(mess);
        console.log("signature", signature);
        if (ans) {
            acceptPost(userId, signerAddress, signature);
        }
    };
    const rejectdeleteConfirmed = async (userId, rejCount) => {
        let ans = window.confirm("Are you sure you want to reject");
        if (ans) {
            try {
                await rejectPost(userId);
                rejCount++;
                if (rejCount >= 3) {
                    await deletePost(userId);
                }
            } catch (err) {
                console.log("error reject api", err);
            }
        }
    };
    const connectWallet = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log("signer", await signer.getAddress());
        setSigner(signer);
        setSignerAddress(address);
        let smcVerify = await new ethers.Contract(verifyAddress, verifyABI, signer);
        let smcToken = await new ethers.Contract(tokenAddress, tokenABI, signer);
        const verifyWithSigner = smcVerify.connect(signer);
        const tokenWithSigner = smcToken.connect(signer);
        setSmcVerify(verifyWithSigner);
        setSmcToken(tokenWithSigner);
    };
    useEffect(() => {
        connectWallet();
        balance(signerAddress);
    }, [reset]);

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await fetch("http://localhost:9000/get", {
                    method: "GET",
                });
                const data = await res.json();
                setPosts(data);
            } catch (err) {
                console.log(err);
            }
        };
        return getData;
    }, [del._id]);
    
    const balance = async (add) => {
        let balance = await token.balanceOf(add);
        console.log(balance.toString(), "balanceOf");
        setBalanceToken(balance.toString())
    }

    const handleReset = () => {
        let check = reset + 1;
        setReset(check);
    }

    const handleReward = async (id, listSign) => {
        console.log("list", listSign);
        let arrSign = [];
        listSign.map((item, index) => {
            arrSign.push(item.sign);
        });
        console.log("list", verify);
        try {
            await verify.rewardToken(signerAddress, id, arrSign);
        } catch (err) {
            console.log("err", err);
        }
    }

    return (
        <div>
            <h2 className="mt-5 mb-5">Data Censorship</h2>
            <h2 className="mt-5 mb-5">Address: {signerAddress}</h2>
            <h2 className="mt-5 mb-5">Address: {balanceToken}</h2>
            <button onClick={() => handleReset()} >reset</button>
            <div className="row">
                {!posts ? (
                    <h2>Loading...</h2>
                ) : (
                    posts.map((post) => {
                        let photoUrl = post.photo
                            ? `http://localhost:9000/photo/${
                                  post._id
                              }?${new Date().getTime()}`
                            : DefaultPhoto;

                        return (
                            <div className="col-lg-4" key={post._id}>
                                <MDBCard>
                                    <MDBCardImage
                                        src={photoUrl}
                                        alt={post.name}
                                        style={{
                                            height: "300px",
                                            width: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <MDBCardBody>
                                        <MDBCardTitle>{post.name}</MDBCardTitle>
                                        <MDBCardText>
                                            {post.address}
                                        </MDBCardText>
                                        <Link
                                            to={`edit/${post._id}`}
                                            state={{ ...post }}
                                            className="btn btn-warning"
                                        >
                                            Ed
                                        </Link>
                                        <MDBBtn
                                            className="btn btn-danger ms-3"
                                            onClick={() =>
                                                deleteConfirmed(post._id)
                                            }
                                        >
                                            De
                                        </MDBBtn>
                                        <MDBBtn
                                            className="btn btn-success ms-3"
                                            onClick={() =>
                                                acceptConfirmed(
                                                    post._id,
                                                    post.address
                                                )
                                            }
                                        >
                                            Ac
                                        </MDBBtn>
                                        <MDBBtn
                                            className="btn btn-danger ms-3"
                                            onClick={() =>
                                                rejectdeleteConfirmed(
                                                    post._id,
                                                    post.reject
                                                )
                                            }
                                        >
                                            Re
                                        </MDBBtn>
                                    </MDBCardBody>
                                    <p className="ms-3" >Accept: {post.accept}</p>
                                    <p className="ms-3" >Reject: {post.reject}</p>
                                </MDBCard>
                            </div>
                        );
                    })
                )}
            </div>
            <h2>
                -----------------------------------------------------------------------------------------------
            </h2>
            <h2 className="mt-5 mb-5">Public</h2>
            <div className="row">
                {!posts ? (
                    <h2>Loading...</h2>
                ) : (
                    posts.map((post) => {
                        if (post.accept < 3) {
                            return "";
                        }
                        let photoUrl = post.photo
                            ? `http://localhost:9000/photo/${
                                  post._id
                              }?${new Date().getTime()}`
                            : DefaultPhoto;

                        return (
                            <div className="col-lg-4" key={post._id}>
                                <MDBCard>
                                    <MDBCardImage
                                        src={photoUrl}
                                        alt={post.name}
                                        style={{
                                            height: "300px",
                                            width: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <MDBCardBody>
                                        <MDBCardTitle>{post.name}</MDBCardTitle>
                                        <MDBCardText>
                                            {post.address}
                                        </MDBCardText>
                                        <MDBBtn
                                            className="btn btn-danger ms-3"
                                            onClick={() =>
                                                deleteConfirmed(post._id)
                                            }
                                        >
                                            De
                                        </MDBBtn>
                                        {post.accept >= 3 ? (
                                            <MDBBtn
                                                className="btn btn-info ms-3 mt-3"
                                                onClick={() =>
                                                    handleReward(
                                                        post._id, post.listSign
                                                    )
                                                }
                                            >
                                                Reward
                                            </MDBBtn>
                                        ) : (
                                            ""
                                        )}
                                    </MDBCardBody>
                                    <p className="ms-3" >Accept: {post.accept}</p>
                                </MDBCard>
                                <MDBCardFooter></MDBCardFooter>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GetForm;
