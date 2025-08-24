import reducer from "./reducer/authSlice";
import { injectReducer } from "./store";

const withReducer = (key, reducer) => (WrappedComponent) => {
  injectReducer(key, reducer);

  return (props) => <WrappedComponent {...props} />;
};
export default withReducer;
