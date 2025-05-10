// backend/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Scholarship', 'Payment', 'Student', 'Donor']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for frequently queried fields
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

// Setup change stream to watch for notification changes
NotificationSchema.statics.watchNotifications = function() {
  const changeStream = this.watch();
  
  changeStream.on('change', (change) => {
    // Here you would emit the notification to connected clients
    // using a real-time technology like Socket.io
    console.log('Notification change detected:', change);
    
    // If you have a socket.io instance:
    // io.to(change.fullDocument.recipient.toString())
    //   .emit('notification', change.fullDocument);
  });
  
  return changeStream;
};

// Mark notifications as read
NotificationSchema.statics.markAsRead = async function(userId, notificationIds) {
  return this.updateMany(
    { 
      recipient: userId,
      _id: { $in: notificationIds }
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

// Create notification method
NotificationSchema.statics.createNotification = async function(data) {
  const notification = await this.create(data);
  
  // If socket.io was implemented:
  // io.to(data.recipient.toString()).emit('notification', notification);
  
  return notification;
};

module.exports = mongoose.model('Notification', NotificationSchema);