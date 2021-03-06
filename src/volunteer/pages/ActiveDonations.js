import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import SimplePaper from "../../shared/components/material-ui/SimplePaper";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../shared/hooks/auth-hook";
import Path from "../../shared/Path";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const ActiveDonations = () => {
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [requests, setActiveRequests] = useState([]);
  const [currentIndex, setIndex] = useState(0);
  const [dialogName, setDialogName] = useState("");
  const { token, login, logout, userId, type } = useAuth();

  const handleClickOpen = (index) => {
    setOpen(true);
    setIndex(index);
    setDialogName(requests[index].itemName);
  };

  const authSubmitHandler = async (event) => {
    let data = {
      ...requests[currentIndex],
    };
    data.volunteerId = userId;
    // console.log(data);
    try {
      const responseData = await sendRequest(
        `${Path}api/volunteer/acceptRequest`,
        "POST",
        JSON.stringify(data),
        {
          "Content-Type": "application/json",
        }
      );
      console.log(responseData);
    } catch (err) {}
  };

  const handleClose = (status) => {
    setOpen(false);
    if (status == true) {
      authSubmitHandler();
      history.push(`/leaderboard/${userId}`);
      console.log(userId);
    }
  };

  useEffect(() => {
    const activeDonations = async () => {
      try {
        const responseData = await sendRequest(
          `${Path}api/volunteer/activeDonationRequest`
        );
        let result = responseData.items.map((data) => ({
          _id: data._id,
          userId: data.userId,
          itemName: data.itemName,
          category: data.category,
          quantity: data.quantity,
          date: data.date,
          address:
            data.address.house +
            " " +
            data.address.street +
            " " +
            data.address.landmark +
            " " +
            data.address.pincode +
            " " +
            data.address.city +
            " " +
            data.address.state,
        }));

        setActiveRequests(result);
      } catch (err) {}
    };
    activeDonations();
  }, [sendRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'>
        <DialogTitle id='alert-dialog-title'>
          {"Accept this Donation Request?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            You agree that you will pick up <u>{dialogName}</u> on the scheduled
            pickup date
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose(false);
            }}
            color='primary'>
            No
          </Button>
          <Button
            onClick={() => {
              handleClose(true);
            }}
            color='primary'>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <SimplePaper title='Active Donation Requests'></SimplePaper>
      <TableContainer component={Paper}>
        {isLoading && (
          <div className='center'>
            <LoadingSpinner />
          </div>
        )}
        {!isLoading && requests && (
          <Table className={classes.table} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell align='right'>Category</TableCell>
                <TableCell align='right'>Quantity</TableCell>
                <TableCell align='right'>Pickup Date</TableCell>
                <TableCell style={{ width: "30%" }} align='right'>
                  Address
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow
                  style={{ cursor: "pointer" }}
                  key={index}
                  onClick={() => {
                    handleClickOpen(index);
                  }}>
                  <TableCell component='th' scope='row'>
                    {request.itemName}
                  </TableCell>
                  <TableCell align='right'>{request.category}</TableCell>
                  <TableCell align='right'>{request.quantity}</TableCell>
                  <TableCell align='right'>
                    {request.date.slice(0, 16)}
                  </TableCell>
                  <TableCell align='right'>{request.address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </>
  );
};

export default ActiveDonations;
