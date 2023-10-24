import asyncHandler from 'express-async-handler';
import Tree from '..//models/userTree.js'
import User from '../models/userModel.js';

// const findNodes = asyncHandler(async( email, cycle ) =>{

//   const invitees = await Tree.find({ email : email, cycle : cycle });
//   let tree_users = [];
//   let node1 = {};
//   let node2 = {};


//   if (invitees) {
//     try {
//     await Promise.all(invitees.map(async (invitee) => {
//       const iemail = invitee.node;
//       const tree_user = await User.findOne({ email: iemail });
//       if (tree_user) {
//         tree_users.push(tree_user);
//       }
//     }));

//     if(tree_users && tree_users.length > 0) {
//       node1 = {      
//         username : tree_users[0].username,
//         email : tree_users[0].email,
//         avatar : tree_users[0].avatar,
//       };
//       if (tree_users.length > 1) {
//         node2 = {
//           username: tree_users[1].username,
//           email: tree_users[1].email,
//           avatar: tree_users[1].avatar,
//         };
//       }
//     }
//     return [ node1, node2 ];
//   } catch(err) {
//     console.error(err);
//   }

//   } else {
//     return [ node1, node2 ];
//   }

// });

const findNodes = asyncHandler(async (email, cycle) => {
  const invitees = await Tree.find({ email: email, cycle: cycle });
  let tree_users = [];
  let nodes = []; // Array to store all nodes

  if (invitees) {
    try {
      await Promise.all(
        invitees.map(async (invitee) => {
          const iemail = invitee.node;
          const tree_user = await User.findOne({ email: iemail });
          if (tree_user) {
            tree_users.push(tree_user);
          }
        })
      );

      if (tree_users && tree_users.length > 0) {
        // Loop through all tree_users to create nodes
        tree_users.forEach((tree_user) => {
          const node = {
            username: tree_user.username,
            email: tree_user.email,
            avatar: tree_user.avatar,
          };
          nodes.push(node);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  return nodes;
});


const showTree = asyncHandler(async (req, res) =>{
  const { email, cycle } = req.body;
  

  let [ node1, node2 ] = await findNodes(email, cycle);
  let node11 = {};
  let node12 = {};
  let node21 = {};
  let node22 = {};
  
  if (node1) {
     [ node11, node12 ]  = await findNodes(node1.email, cycle);

  }
  
  if (node2) {
     [ node21, node22 ]  = await findNodes(node2.email, cycle);
  }

  res.json({
    node1 : node1,
    node2 : node2,
    node11 : node11,
    node12 : node12,
    node21 : node21,
    node22 : node22,
  });

  // if(tree_users && tree_users.length > 0) {
  // node1 = {      
  //   username : tree_users[0].username,
  //   email : tree_users[0].email,
  //   avatar : tree_users[0].avatar,
  // };
  // if (tree_users.length > 1) {
  //   node2 = {
  //     username: tree_users[1].username,
  //     email: tree_users[1].email,
  //     avatar: tree_users[1].avatar,
  //   };
  // }
  
  
  // let node11 = {};
  // let node12 = {};
  // try {
  //   let node1_users = await findNodes(node1.email);

  //   if (node1_users&&node1_users.length > 0) {
  //     node11 = {
  //       username: node1_users[0].username,
  //       email: node1_users[0].email,
  //       avatar: node1_users[0].avatar,
  //     };
  //     if (node1_users.length > 1) {
  //       node12 = {
  //         username: node1_users[1].username,
  //         email: node1_users[1].email,
  //         avatar: node1_users[1].avatar,
  //       };
  //     }
  //   }
  // } catch (error) {
  //   console.error(error); 
  // }

    
  // let node21 = {};
  // let node22 = {};
  // try {
  //   let node2_users = await findNodes(node2.email);

  //   if (node2_users&&node2_users.length > 0) {
  //     node21 = {
  //       username: node2_users[0].username,
  //       email: node2_users[0].email,
  //       avatar: node2_users[0].avatar,
  //     };
  //     if (node2_users.length > 1) {
  //       node22 = {
  //         username: node2_users[1].username,
  //         email: node2_users[1].email,
  //         avatar: node2_users[1].avatar,
  //       };
  //     }
  //   }
  // } catch (error) {
  //   console.error(error); 
  // }

  // res.json({
  //   node1 : node1,
  //   node2 : node2,
  //   node11 : node11,
  //   node12 : node12,
  //   node21 : node21,
  //   node22 : node22,
  // });

  // } else {
  //   res.status(400).json({message:"Factal Error! Please try again."});
  // }

});


export {
  showTree
};
