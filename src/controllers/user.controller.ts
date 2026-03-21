import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest, IPaginationQuery, TypedRequest } from '../types';
import { User, Role, Booking, Review, Favorite, Tour } from '../db/models';
import { NotFoundError, BadRequestError } from '../utils';

interface UpdatePersonalInfoBody {
    full_name: string;
    email: string;
    phone_number?: string;
}

interface ChangePasswordBody {
    current_password: string;
    new_password: string;
}

export const updatePersonalInfo = async (
    req: AuthenticatedRequest<{}, {}, UpdatePersonalInfoBody>,
    res: Response
): Promise<void> => {
    const { full_name, email, phone_number } = req.body;
    const user_id = req.user_id;

    const user = await User.findByPk(user_id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    user.full_name = full_name;
    user.email = email;

    if (req.body.hasOwnProperty('phone_number')) {
        user.phone_number = phone_number ? phone_number : null;
    }

    await user.save();

    res.json({
        message: 'Personal information updated successfully',
        user
    });
};

export const changePassword = async (
    req: AuthenticatedRequest<{}, {}, ChangePasswordBody>,
    res: Response
): Promise<void> => {
    const { current_password, new_password } = req.body;
    const user_id = req.user_id;

    const user = await User.findByPk(user_id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
        throw new BadRequestError('Incorrect current password');
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
};

// --- Admin Controls ---

export const getAllUsers = async (
    req: TypedRequest<{}, {}, {}, IPaginationQuery>,
    res: Response
): Promise<void> => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
        include: [{ model: Role, as: 'Role' }],
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']],
        limit,
        offset,
    });

    res.status(200).json({
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        users: rows,
    });
};

export const getUserById = async (
    req: TypedRequest<{ user_id: number }>,
    res: Response
): Promise<void> => {
    const user = await User.findByPk(req.params.user_id, {
        include: [{ model: Role, as: 'Role' }],
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(200).json(user);
};

export const updateUserRole = async (
    req: TypedRequest<{ user_id: number }, {}, { role_id: number }>,
    res: Response
): Promise<void> => {
    const { role_id } = req.body;
    
    // Check if role exists
    const role = await Role.findByPk(role_id);
    if (!role) {
        throw new BadRequestError('Invalid role ID');
    }

    const user = await User.findByPk(req.params.user_id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    user.role_id = role_id;
    await user.save();

    res.status(200).json({ message: 'User role updated successfully', user });
};

export const updateUserAdmin = async (
    req: TypedRequest<{ user_id: number }, {}, { full_name: string; email: string; phone_number?: string | null; role_id: number }>,
    res: Response
): Promise<void> => {
    const { full_name, email, phone_number, role_id } = req.body;
    
    // Check if role exists
    const role = await Role.findByPk(role_id);
    if (!role) {
        throw new BadRequestError('Invalid role ID');
    }

    const user = await User.findByPk(req.params.user_id, {
        include: [{ model: Role, as: 'Role' }]
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    user.full_name = full_name;
    user.email = email;
    user.role_id = role_id;
    if (req.body.hasOwnProperty('phone_number')) {
        user.phone_number = phone_number ? phone_number : null;
    }

    await user.save();
    
    // Reload to get the updated role details
    await user.reload({ include: [{ model: Role, as: 'Role' }] });

    const userJSON = user.toJSON();
    delete (userJSON as any).password;

    res.status(200).json({ message: 'User updated successfully', user: userJSON });
};

export const deleteUser = async (
    req: TypedRequest<{ user_id: number }>,
    res: Response
): Promise<void> => {
    const deleted = await User.destroy({ where: { user_id: req.params.user_id } });

    if (!deleted) {
        throw new NotFoundError('User not found');
    }

    res.status(200).json({ message: 'User deleted successfully' });
};

export const getUserStats = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const user_id = req.user_id;

    const [
        totalBookings,
        totalReviews,
        totalFavorites,
        recentBookings
    ] = await Promise.all([
        Booking.count({ where: { user_id } }),
        Review.count({ where: { user_id } }),
        Favorite.count({ where: { user_id } }),
        Booking.findAll({
            where: { user_id },
            limit: 3,
            order: [['created_at', 'DESC']],
            include: [{ model: Tour, attributes: ['name', 'tour_id'] }]
        })
    ]);

    // Simple Member Rank logic
    let rank = 'Explorer';
    if (totalBookings >= 6) rank = 'Legend';
    else if (totalBookings >= 2) rank = 'Voyager';

    res.status(200).json({
        stats: {
            totalBookings,
            totalReviews,
            totalFavorites,
            rank
        },
        recentBookings
    });
};
