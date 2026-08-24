import axios from 'axios';

export const getCurrentUser = async (token) => {
  	try {
		const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_JWT}/wp/v2/users/me`, {
			params: { context: 'edit' },
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data; // Return user data
  	} catch (error) {
    	console.error('Failed to fetch current user:', error);
    	return null; // User is not logged in
  	}
};