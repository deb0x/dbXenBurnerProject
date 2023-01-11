import { useState, forwardRef, useEffect } from 'react'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SnackbarNotification(props: any) {

  const [state, setState] = useState({ severity: props.state.severity, open: props.state.open, message: props.state.message })

  useEffect(() => {
    setState({severity: props.state.severity, open: props.state.open, message: props.state.message})
  }, [props])

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setState({
      message: state.message, open: false,
      severity: state.severity
    })
  };

  return (
    <Snackbar open={state.open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={state.severity} sx={{ width: '100%' }}>
        {state.message}
      </Alert>
    </Snackbar>
  )
}