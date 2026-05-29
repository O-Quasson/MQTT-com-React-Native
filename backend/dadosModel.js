import { DataTypes } from "sequelize";
import { toDefaultValue } from "sequelize/lib/utils";

export default (sequelize) => {

    const dice = sequelize.define('Dados', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        luz: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        temperatura: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        umidade: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'Dados',
        timestamps: true
    });

    return dice;
}