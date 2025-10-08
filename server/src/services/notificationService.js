// server/services/notificationService.js
const socketIo = require('socket.io');
const aiService = require('./aiService');

class NotificationService {
    constructor(server) {
        this.io = socketIo(server, {
            cors: { origin: process.env.CLIENT_URL }
        });
        
        this.setupSocketHandlers();
        this.startPeriodicPredictions();
    }
    
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);
            
            socket.on('join-business', (businessId) => {
                socket.join(`business-${businessId}`);
            });
            
            socket.on('join-recipient', (recipientId) => {
                socket.join(`recipient-${recipientId}`);
            });
            
            socket.on('join-driver', (driverId) => {
                socket.join(`driver-${driverId}`);
            });
        });
    }
    
    async notifyNewMatch(foodItem, recipients) {
        const matches = await aiService.findMatches(foodItem._id);
        
        matches.forEach(match => {
            this.io.to(`recipient-${match.recipient_id}`).emit('new-food-available', {
                foodItem,
                matchScore: match.score_data.overall_score,
                estimatedImpact: match.score_data.estimated_impact
            });
        });
        
        // Notify business of successful matching
        this.io.to(`business-${foodItem.business_id}`).emit('food-matched', {
            foodId: foodItem._id,
            matchCount: matches.length
        });
    }
    
    async notifyUrgentSurplus(businessId, prediction) {
        if (prediction.predicted_surplus > 50) {
            this.io.to(`business-${businessId}`).emit('surplus-alert', {
                prediction,
                message: 'High surplus predicted! Consider posting items early.',
                urgency: 'high'
            });
        }
    }
    
    startPeriodicPredictions() {
        // Run predictions every hour
        setInterval(async () => {
            await this.runPredictionsForActiveBusinesses();
        }, 60 * 60 * 1000);
    }
    
    async runPredictionsForActiveBusinesses() {
        const activeBusinesses = await User.find({ 
            userType: 'business', 
            isActive: true 
        });
        
        for (let business of activeBusinesses) {
            try {
                const prediction = await aiService.predictSurplus(business._id);
                await this.notifyUrgentSurplus(business._id, prediction);
            } catch (error) {
                console.error('Prediction error for business:', business._id, error);
            }
        }
    }
}

module.exports = NotificationService;