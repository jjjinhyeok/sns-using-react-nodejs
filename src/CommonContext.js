import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactLoading from 'react-loading';
import styled from 'styled-components';
import { useLocation, } from 'react-router-dom';

// loading spin
const WrapLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 30px;
`;

export const Loading = () => (
  <WrapLoading>
    <ReactLoading type={'spin'} color={'gray'} height={'15%'} width={'15%'} /> 
  </WrapLoading>
);

// scroll to top using component
export const ScrollToTop = ({ children }) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location])

  return <>
    {children}
  </>
};

export const useStateWithPromise = (initialState) => {
  const [state, setState] = useState(initialState);
  const resolverRef = useRef(null);

  useEffect(() => {
    if (resolverRef.current) {
      resolverRef.current(state);
      resolverRef.current = null;
    }
  }, [resolverRef.current, state]);

  const handleSetState = useCallback((stateAction) => {
    setState(stateAction);
    return new Promise(resolve => {
      resolverRef.current = resolve;
    });
  }, [setState])

  return [state, handleSetState];
};
