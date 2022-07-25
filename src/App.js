import React, {
  useState,
  useEffect,
  useRef,
  TextareaHTMLAttributes,
} from "react";
import { Auth, Hub, API, Storage } from "aws-amplify";
import Amplify from "aws-amplify";
import config from "./aws-exports.js";

import {
  Alert,
  Button,
  Heading,
  ToggleButton,
  Flex,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  ThemeProvider,
  Theme,
  TextAreaField,
  SelectField,
  useTheme,
} from "@aws-amplify/ui-react";
import { AiTwotoneDelete } from "react-icons/ai";
import TextareaAutosize from 'react-textarea-autosize';
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(config);

function App() {
  // For midway authentication
  const [user, setUser] = useState(null);
  // For midway authentication: use effect
  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          console.log(event);
          console.log(data);
          getUser().then((userData) => setUser(userData));
          break;
        case "signOut":
          setUser(null);
          break;
        case "signIn_failure":
          console.log("Sign in failure", data);
          break;
      }
    });
    getUser().then((userData) => setUser(userData));
  }, []);
  // For midway authentication: Get user
  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then((userData) => userData)
      .catch(() => console.log("Not signed in"));
  }


  // For form
  const [customer, setCustomer] = useState('');
  const [service, setService] = useState('');
  const [claim, setClaim] = useState('');
  const [winloss, setWinloss] = useState('');
  const [priority, setPriority] = useState('');
  const [serviceteam, setServiceteam] = useState('');
  const [use, setUse] = useState(''); 


  // For signin and out button
  const { tokens } = useTheme();

  // Table Theme
  const theme: Theme = {
    name: "table-theme",
    tokens: {
      components: {
        table: {
          row: {
            hover: {
              backgroundColor: { value: "{colors.blue.20}" },
            },
            striped: {
              backgroundColor: { value: "{colors.blue.10}" },
            },
          },
          header: {
            color: { value: "{colors.blue.80}" },
            fontSize: { value: "{fontSizes.xl}" },
          },
          data: {
            fontWeight: { value: "{fontWeights.semibold}" },
          },
        },
      },
    },
  };


  // For Gobjs
  const [gobjs, setGobjs] = useState([]);

  // Fetch the gobjs in the table
  async function fetchGobjs(){
    const headers = {
      "Content-Type": "application, json",
    }
    const apiResponse = await fetch('https://hxk1bvw597.execute-api.us-west-2.amazonaws.com/v2/read', {headers} )
    const apiResponseJSON = await apiResponse.json()
    const gs = apiResponseJSON.body
    // console.log(apiResponseJSON)
    console.log(gs)
    setGobjs([...gs])
  }
  // Fetch the gobjs in the table: UseEffect
  useEffect(() => { 
    async function fetc(){
      const headers = {
        "Content-Type": "application, json",
      }
      const apiResponse = await fetch('https://hxk1bvw597.execute-api.us-west-2.amazonaws.com/v2/read', {headers} )
      const apiResponseJSON = await apiResponse.json()
      const gs = apiResponseJSON.body
      // console.log(apiResponseJSON)
      console.log("This is gs: " + gs)
      setGobjs([...gs])
      // Trying to sort the array of objects
      console.log("This is gobjs: " + gobjs);
      console.log("Sorted gobjs: " + sortObject(gobjs));
      console.log(Object.entries(gobjs))
      console.log(Object.entries(gobjs).sort((a,b) => {return a.created_at - b.created_at} ))
    }
    fetc()
  }, []);

  // Trying to sort the gobjs
  const sortObject = obj => {
    const arr = Object.keys(obj).map(el => {
       return obj[el];
    });
    arr.sort((a, b) => {
       return a - b;
    });
    return arr;
  };

  // Creating gobjs
  async function createGobj() {
    setUse('testUser');
    console.log(use);
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({ customer: customer, 
                               service: service,
                               claim: claim,
                               winloss: winloss,
                               priority: priority,
                               serviceteam: serviceteam,
                              //  user: user.username
                              user: 'testUser'
                              });
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    // make API call with parameters and use promises to get response
    await fetch(
      "https://hxk1bvw597.execute-api.us-west-2.amazonaws.com/v0/put",
      requestOptions
    )
      .then((response) => response.text())
      // .then((result) => alert(JSON.parse(result).body))
      .catch((error) => console.log("error", error));
    setCustomer('');
    setService('');
    setClaim('');
    setWinloss('');
    setPriority('');
    setServiceteam('');
    fetchGobjs();
  };


  // Delete gobj
  async function deleteGobj({gobj}){
    console.log(gobj.id);
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({ id: gobj.id });
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
  // make API call with parameters and use promises to get response
  await fetch(
    "https://hxk1bvw597.execute-api.us-west-2.amazonaws.com/v1/delete",
    requestOptions
  )
    .then((response) => response.text())
    // .then((result) => alert(JSON.parse(result).body))
    .catch((error) => console.log("error", error));
  fetchGobjs();
  };

  // Editing gobj

  // Adding
  const [adding, setAdding] = useState(false);

  async function changeAdding() {
    if (adding == false) {
      if (editid != "") {
        setEditid("");
      }
    }
    // Change the adding variable
    setAdding(!adding);
  }

  // Editing
  const [editid, setEditid] = useState("");

  async function change({ id }) {
    // Establishing user identity
    // setFormData({...formData, user: user.username, });
    // console.log(formData.user.username);
    // Setting the id
    if (adding) {
      setAdding(false);
    }
    setEditid(id);
    console.log(editid);
    // Adding fetch after setting the change id
    setTimeout(function(){
      console.log("I am the third log after 5 seconds");
      // fetchGobjs();
    },1000);
  }

  async function clear() {
    // setFormData(initialFormState);
    setAdding(false);
    setEditid("");
  }

  // Controlling who can edit and delete
  async function showUser() {
    console.log(user);
  }

  return (
    <div className="App">

          <div className="signInAndOutDiv">
            {/* Sign out button */}
            <Button
              backgroundColor={tokens.colors.pink[40]}
              onClick={() => Auth.signOut()}
            >
              Sign Out
            </Button>
          </div>
          <Heading level={1}>Dashboard</Heading>

          {/* <button onClick={() => fetchGobjs()}>FETCH</button> */}


          <div className="tableDiv">
            <ThemeProvider theme={theme} colorMode="light">
              <Table highlightOnHover variation="striped">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>User</b>
                    </TableCell>
                    <TableCell className="theadCell">
                      <b>Customer, SA, <i>Gap</i></b>
                    </TableCell>
                    <TableCell>
                      <b>Service</b>
                    </TableCell>
                    <TableCell>
                      <b>GCP Claim / Customer Feedback</b>
                    </TableCell>
                    <TableCell>
                      <b>
                        Win / Loss to GCP? Key factor resulting in loss and
                        learnings
                      </b>
                    </TableCell>
                    <TableCell>
                      <b>Priority / AWS GCP Compete Team Response</b>
                    </TableCell>
                    <TableCell>
                      <b>Service Team PFR / Roadmap</b>
                    </TableCell>
                    <TableCell>
                      <ToggleButton onClick={() => changeAdding()}>
                        {adding ? <>HIDE</> : <>ADD </>}
                      </ToggleButton>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>

                <TableRow>
                  {/* User */}
                  <TableCell>
                      <b>USER FILLER</b>
                    </TableCell>
                  <TableCell>
                    {/* Customer */}
                    <TextareaAutosize
                        className='responsiveTA'
                        // defaultValue={}
                        placeholder="..."
                        onChange={(e) =>
                          setCustomer(e.target.value)
                        }
                        value={customer}
                    />
                  </TableCell>
                  <TableCell>
                    {/* Service */}
                    <TextareaAutosize
                          className='responsiveTA'
                          // defaultValue={}
                          placeholder="..."
                          onChange={(e) =>
                            setService(e.target.value)
                          }
                          value={service}
                      />
                  </TableCell>
                  <TableCell>
                    {/* Claim */}
                    <TextareaAutosize
                        className='responsiveTA'
                        // defaultValue={}
                        placeholder="..."
                        onChange={(e) =>
                          setClaim(e.target.value)
                        }
                        value={claim}
                    />
                  </TableCell>
                  <TableCell>
                    {/* Win/Loss */}
                    <TextareaAutosize
                      className='responsiveTA'
                      // defaultValue={}
                      placeholder="..."
                      onChange={(e) =>
                        setWinloss(e.target.value)
                      }
                      value={winloss}
                    />
                  </TableCell>
                  <TableCell>
                    <SelectField
                      placeholder="Select"
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value)
                      }
                    >
                      <option
                        value="Priority: High"
                        fontSize="var(--amplify-font-sizes-small)"
                      >
                        High
                      </option>
                      <option
                        value="Priority: Medium"
                        fontSize="var(--amplify-font-sizes-small)"
                      >
                        Medium
                      </option>
                      <option
                        value="Priority: Low"
                        fontSize="var(--amplify-font-sizes-small)"
                      >
                        Low
                      </option>
                    </SelectField>
                  </TableCell>
                  <TableCell>
                    {/* Service Team */}
                    <TextareaAutosize
                      className='responsiveTA'
                      // defaultValue={}
                      placeholder="..."
                      onChange={(e) =>
                        setServiceteam(e.target.value)
                      }
                      value={serviceteam}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <Button
                        loadingText=""
                        onClick={() => createGobj()}
                        ariaLabel=""
                        className="submitAndCancel"
                      >
                        Submit
                      </Button>
                    </div>
                    <div>
                      <Button
                        loadingText=""
                        onClick={() => clear()}
                        ariaLabel=""
                        className="submitAndCancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>



                {/* Mapping the gobjs */}
                {
                (gobjs.length > 0)?  
                (
                  gobjs.map((gobj) => (
                  <>
                    <TableRow key={gobj.id}>
                      <TableCell fontSize="var(--amplify-font-sizes-small)">
                        {gobj.user}
                        <br/>
                        <br/>
                        {gobj.created_at.slice(0,-5)}
                      </TableCell>
                      <TableCell fontSize="var(--amplify-font-sizes-small)">
                        {gobj.customer}
                      </TableCell>
                      <TableCell fontSize="var(--amplify-font-sizes-small)">
                        {gobj.service}
                      </TableCell>
                      <TableCell fontSize="var(--amplify-font-sizes-small)">
                        {gobj.claim}
                      </TableCell>
                      <TableCell fontSize="var(--amplify-font-sizes-small)">
                        {gobj.winloss}
                      </TableCell>
                      <TableCell fontSize="var(--amplify-font-sizes-small)">
                        {gobj.priority}
                      </TableCell>
                      <TableCell fontSize="var(--amplify-font-sizes-small)">
                        {gobj.serviceteam}
                      </TableCell>
                      <TableCell fontSize="var(--amplify-font-sizes-small)">
                        <div>
                          {/* <Button onClick={() => change(gobj)}>EDIT</Button> */}
                        </div>
                        <div className='deletIconDiv'>
                          <AiTwotoneDelete
                            className="deleteIcon"
                            onDoubleClick={() => deleteGobj({gobj})}
                          />
                        </div> 
                      </TableCell>
                    </TableRow>
                  </>
                ))
                ):
                (
                  <>
                  <TableRow>
                   <TableCell colSpan='8'>There is no data in this dashboard.</TableCell>
                  </TableRow>
                  </>
                )}

                </TableBody>
              </Table>
            </ThemeProvider>
          </div>


          {/* To be shown the user is not signed in */}
          <Alert variation="info">Please sign-in to view the dashboard.</Alert>
          <div className="signInAndOutDiv">
            <Button
              backgroundColor={tokens.colors.pink[40]}
              onClick={() =>
                Auth.federatedSignIn({ customProvider: "AmazonFederate" })
              }
              className="signInAndOut"
            >
              Sign-In with Midway
            </Button>
          </div>


    </div>
  );
}

export default App;
