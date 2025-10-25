import React from 'react';
import { Container, Typography } from '@mui/material';
import UserLogin from '../components/UserLogin';

function Home({ setLoggedUser }) {
  return (
    <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant="h3" gutterBottom>Bem-vindo ao SectorFlow</Typography>
      <UserLogin setLoggedUser={setLoggedUser} />
    </Container>
  );
}

export default Home;