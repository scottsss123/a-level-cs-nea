const newtonsLawsOfMotionString = `Newton's laws of motion
------------------------
Isaac Newton formulated three 'laws' of motion, which all objects appear to follow. They are as follows:
 
1. Every object perseveres in its state of rest, or of uniform motion in a right line, unless it is compelled to change that state by forces impressed thereon.
2. The change of motion of an object is proportional to the force impressed; and is made in the direction of the straight line in which the force is impressed.
3. To every action, there is always opposed an equal reaction; or, the mutual actions of two bodies upon each other are always equal, and directed to contrary parts.
 
The first of these laws describes the fact that objects that are either stationary or are otherwise moving at a constant velocity are in equillibrium. These objects will remain in equillibrium while the sum of forces acting on it, it's resultant force is zero. 
 
The second of these laws states that the acceleration of the body is proportional to the resultant force and inversely proportional to it's mass.
Describing the following equation:
    a = F / m
Relating the following:
    F, the resultant force acting on the body measured in newtons
    m, the mass of the body in kilograms
    a, the acceleration of the body in meters per second per second.

This can be rearranged to the following famous equation:
    F = ma
 
The third of these laws describes how if there is ever a force acting on a body, there is another force of equal magnitude but opposite direction acting on another body.
 
At a planetary scale ( like with this sandbox-simulation ) the main force acting on objects is the force between two massive bodies due to gravity, weight. This weight, between any two bodies, is proportional to the mass of each body and is inversely proportional to the square of the distance between them.
:   F = Gm₁m₂ / r² 
  where F is the force due to gravity on each body, in the direction between said body and the other
        G is the gravitational constant, some number ≈ 6.67430 * 10⁻¹¹
        m₁, m₂ are the masses of the two bodies
  and   r is the distance between thw two bodies.`;
const SIUnitsString = `SI Units
----------
SI is a french abbreviation for Système international d'unités, in english an international standard of units.`;
const simulationTutorialString = `Controls 
----------------------------------------------------------------------------------------------------------------------
Simulation Controls
-------------------
Open                    Pause Menu      :  Escape
Toggle   simulation     running         :  Spacebar
Adjust   camera's       position        :  w, a, s, d  /  ↑, ←, ↓, →
Adjust   camera's       Zoom            :  scroll up   /  scroll down  (hold control for more precise scrolling input)
Adjust   simulation's   time rate       :  scroll up   /  scroll down  (while mouse over time rate 'x0.000') (for now)
Follow   existing       body            :  f, type body name, enter
Pan to   existing       body            :  p, type body name, enter
Stop     following      body            :  f, enter
Create   new            body info box   :  left click,  on body
Create   new            body change box :  right click, cursor on body
Move     existing       body info box   :  Control + left click + drag
Move     existing       body change box :  Control + left click + drag
Create   new            body            :  Control + Alt + Right click , cursor outside body
Move     existing       body            :  Control + Left click + drag
    
Load simulation menu controls  
-----------------------------
View     Next / Prev    simulation      :  ←, →
`;