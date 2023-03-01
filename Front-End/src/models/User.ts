type User = {
  id: number;
  zutID: string;
  username: string;
  name: string;
  lastName: string;
  email: string;
  role?: {
    role_id: string;
    role_name: string;
  };
};

export default User;
