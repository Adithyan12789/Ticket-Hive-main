// import React, { useEffect } from 'react';
// import { Image, Nav } from 'react-bootstrap';
// import { LinkContainer } from 'react-router-bootstrap';
// import io from 'socket.io-client';
// import defaultProfileImage from '../../../public/profileImage_1729749713837.jpg'
// import { useFetchUnreadMessagesQuery } from '../../Store/TheaterApiSlice';

// const socket = io("https://localhost:3000");

// interface SidebarProps {
//   profileImage: string | File | null; // String (image URL), File (file object), or null (no image)
//   name: string;
// }

// const Sidebar: React.FC<SidebarProps> = ({ profileImage, name }) => {
//   const getImageUrl = (imageName: string | undefined): string => {
//     if (!imageName) return defaultProfileImage;
//     return `https://celebratespaces.site/UserProfileImages/${imageName.replace(
//       'backend\\public\\',
//       ''
//     )}`;
//   };

//   const { data: unreadMessages, isLoading, isError, refetch } = useFetchUnreadMessagesQuery({});

//   useEffect(() => {
//     refetch();
//   }, [refetch]);

//   useEffect(() => {
//     socket.on("messageRead", () => {
//       refetch();
//     });

//     return () => {
//       socket.off("messageRead");
//     };
//   }, [refetch]);

//   const hasUnreadMessages = !isLoading && !isError && unreadMessages?.length > 0;

//   return (
//     <div className="sidebarprofile">
//       <Image
//         src={
//           profileImage
//             ? typeof profileImage === 'string'
//               ? getImageUrl(profileImage)
//               : URL.createObjectURL(profileImage)
//             : defaultProfileImage
//         }
//         className="sidebar-image"
//         alt={name}
//       />
//       <Nav className="flex-column">
//         <LinkContainer to="/profile">
//           <Nav.Link className="sidebar-link">My Profile</Nav.Link>
//         </LinkContainer>
//         <LinkContainer to="/bookings">
//           <Nav.Link className="sidebar-link">Bookings</Nav.Link>
//         </LinkContainer>
//         <LinkContainer to="/wallet">
//           <Nav.Link className="sidebar-link">Wallet</Nav.Link>
//         </LinkContainer>
//         <LinkContainer to="/chat/:hotelId">
//           <Nav.Link className="sidebar-link">
//             Messages
//             {hasUnreadMessages && <span className="dot-indicator"></span>}
//           </Nav.Link>
//         </LinkContainer>
//       </Nav>
//     </div>
//   );
// };

// export default Sidebar;
