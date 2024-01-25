import appUrls from "./apiUrl";
import axios from "axios";
/**
 * apiClientBuilder function
 *
 * @param {string} baseURL
 * @returns {{
 *   getData: {
 *     (
 *       pathReq: string, queryParams?: JSON, headers?: JSON
 *     ): Promise<any>
 *   };
 *   postData: {
 *     (
 *       pathReq: string, body?: JSON, queryParams?: JSON, headers?: JSON
 *     ): Promise<any>
 *   };
 *   patchData: {
 *     (
 *       pathReq: string, body?: JSON, queryParams?: JSON, headers?: JSON
 *     ): Promise<any>
 *   };
 *   putData: {
 *     (
 *       pathReq: string, body?: JSON, queryParams?: JSON, headers?: JSON
 *     ): Promise<any>
 *   };
 *   deleteData: {
 *     (
 *       pathReq: string, queryParams?: JSON, headers?: JSON
 *     ): Promise<any>
 *   };
 *   uploadFiles: {
 *     (
 *       pathReq: string, formData: FormData, queryParams?: JSON, headers?: JSON
 *     ): Promise<any>
 *   };
 * }}
 */
const apiClientBuilder = (baseURL:any) => {
  const api = axios.create({ baseURL });

  // console.log(networkInterfaces)

  var token : string = '';

  // token = localStorage.getItem('authToken') || '';

 
  let _headers : any = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  if(token)
  _headers["Authorization"] = "Bearer " + token;


  // const getBaseHeaders = () => {
    
  //   let arr = {
  //     "content-type": "application/json",
  //     "Access-Control-Allow-Origin": "*"
  //   };

  //   if (token != "")
  //     arr = {
  //       authorization: "Bearer " + token,
  //       "content-type": "application/json",
  //       "Access-Control-Allow-Origin": "*"
  //     };

  //   return arr;
  // };

  // console.log(getBaseHeaders().then(data=>{console.log(data)}))

  // IMPORTANT
  // getBaseHeaders replaced with param option for token (cauz had issues)

  return {
    getData(pathReq:any, queryParams = undefined, _headers = undefined) {
      return new Promise((resolve, reject) => {
 
            api
              .get(pathReq, {
                params: !queryParams ? {} : queryParams,
                headers: _headers ? _headers : {}
              })
              .then(
                response => {
                  if (response.data.failure) {
                    reject(response.data);
                    return;
                  }
                  if (response.data.error) {
                    reject(response.data.error);
                    return;
                  }
                  resolve(response.data);
                },
                error => reject(error)
              )
              .catch(err => reject(err));
          
        
      
        });
    },

    postData(
      pathReq:any,
      body = undefined,
      queryParams = undefined,
      headers = undefined
    ) {
      return new Promise((resolve, reject) => {

        


          api
            .post(pathReq, !body ? {} : body, {
              params: !queryParams ? {} : queryParams,
              headers: headers ? _headers : {}
            })
            .then(
              response => {
                // console.log(headers)
                if (response.data.failure) {
                  reject(response.data);
                  return;
                }
                if (response.data.error) {
                  reject(response.data.error);
                  return;
                }
                resolve(response.data);
              },
              error => reject(error)
            )
            .catch(err => reject(err));

      });
    },

    putData(
      pathReq:any,
      body = undefined,
      queryParams = undefined,
      headers = undefined
    ) {
      return new Promise((resolve, reject) => {
      
        


  
          api
            .put(pathReq, !body ? {} : body, {
              params: !queryParams ? {} : queryParams,
              headers: headers ? _headers : {}
            })
            .then(
              response => {
                if (response.data.failure) {
                  reject(response.data);
                  return;
                }
                if (response.data.error) {
                  reject(response.data.error);
                  return;
                }
                resolve(response.data);
              },
              error => reject(error)
            )
            .catch(err => reject(err));
      
          
      });
    },


    patchData(
      pathReq:any,
      body = undefined,
      queryParams = undefined,
      headers = undefined
    ) {
      return new Promise((resolve, reject) => {
      
        

  
          api
            .patch(pathReq, !body ? {} : body, {
              params: !queryParams ? {} : queryParams,
              headers: headers ? _headers : {}
            })
            .then(
              response => {

                if (response.data.failure) {
                  reject(response.data);
                  return;
                }
                if (response.data.error) {
                  reject(response.data.error);
                  return;
                }
                resolve(response.data);

              },
              error => {reject(error) 
              }
            )
            .catch(err => {reject(err)
            });
        
          
      });
    },

    deleteData(pathReq:any, queryParams = undefined, headers = undefined) {
      return new Promise((resolve, reject) => {
       
           api
            .delete(pathReq, {
              params: !queryParams ? {} : queryParams,
              headers: headers ? _headers : {}
            })
            .then(
              response => {
                if (response.data.failure) {
                  reject(response.data);
                  return;
                }
                if (response.data.error) {
                  reject(response.data.error);
                  return;
                }
                resolve(response.data);
              },
              error => reject(error)
            )
            .catch(err => reject(err));


      });
    },

    uploadFiles(
      pathReq:any,
      formData:any,
      queryParams = undefined,
      headers = undefined
    ) {
      return new Promise((resolve, reject) => {
        api
          .post(pathReq, formData, {
            params: !queryParams ? {} : queryParams,
            headers: {
              "content-type": "multipart/form-data",
              ...(!headers ? {} : headers)
            }
          })
          .then(
            response => {
              if (response.data.failure) {
                reject(response.data);
                return;
              }
              if (response.data.error) {
                reject(response.data.error);
                return;
              }
              resolve(response.data);
            },
            error => reject(error)
          )
          .catch(err => reject(err));
      });
    }
  };
};

export const api = apiClientBuilder(appUrls.apiUrl);
export const headers = {
  authorization: "",
  "content-type": "application/json",
  "Access-Control-Allow-Origin": "*"
};
