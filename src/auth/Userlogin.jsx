import React from 'react';
import Header from '../components/Header'
import Loginform from '../components/Loginform';
function Userlogin() {
   
  return (
    <>

    <Header/>
    <p className='fs-4'>Welcome to <b>WordGAMLE!</b></p>
    <p>For now, we’re just playing Wordle and storing results.</p>  
    <p>Please create your profile and then click the Wordle button and go from there!</p>
    <Loginform/>
        {/* {/* <div id="page-container">
            <main id="main-container">
                <div className="bg-image">
                    
                    <div className="row no-gutters bg-primary-gn">
                        <div className="hero-static col-md-6 d-flex align-items-center bg-white">
                            <div className="p-3 w-100">
                            
                                <div className="mb-3 text-center">
                                    <a className="link-fx font-w700 font-size-h1" href="index.html">
                                        <img className="img-fluid" src={logo} width={150+'px'}></img>
                                    </a>
                                    <p className="text-uppercase font-w700 font-size-sm text-muted">Sign In</p>
                                </div>
                                <div className="row no-gutters justify-content-center">
                                    <div className="col-sm-8 col-xl-6">
                                        <form className="js-validation-signin" >
                                            <div className="py-3">
                                                <div className="form-group">
                                                    <input type="email" className="form-control form-control-lg form-control-alt"  onChange={(e) => setEmail(e.target.value)} value={email} id="login-email" name="login-email" placeholder="Email" />
                                                    {errors.email && <p className='form-validation-error'>{errors.email}</p>}
                                                </div>
                                                <div className="form-group">
                                                    <input type="password" className="form-control form-control-lg form-control-alt"  onChange={(e) => setPassword(e.target.value)} value={password} id="login-password" name="login-password" placeholder="Password" />
                                                    {errors.password && <p className='form-validation-error'>{errors.password}</p>}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <button onClick ={handleSubmit} type="submit"  className="btn btn-block btn-hero-lg btn-hero-primary">
                                                    <i className="fa fa-fw fa-sign-in-alt mr-1"></i> Sign In
                                                </button>
                                                <p className="mt-3 mb-0 d-lg-flex justify-content-lg-between">
                                                    <Link className="btn btn-sm btn-light d-block d-lg-inline-block mb-1" to="/reset-password">
                                                        <i className="fa fa-exclamation-triangle text-muted mr-1"></i> Forgot password
                                                    </Link>
                                                    <Link className="btn btn-sm btn-light d-block d-lg-inline-block mb-1" to="/register">New Account</Link>
                                                </p>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <div className="hero-static col-md-6 d-none d-md-flex align-items-md-center justify-content-md-center text-md-center">
                            <div className="p-3">
                                <p className="display-4 font-w700 text-white mb-3">
                                    Welcome to the future
                                </p>
                                <p className="font-size-lg font-w600 text-white-75 mb-0">
                                    Copyright &copy; <span className="js-year-copy">2018</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div> */}
    
    </>
  )
}

export default Userlogin